// Copyright 2026 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

package admission

import (
	"sort"

	"github.com/cockroachdb/cockroach/pkg/util/syncutil"
	"github.com/cockroachdb/errors"
	"github.com/cockroachdb/redact"
)

// ResourceGroupConfig is the per-group state WorkQueue applies when admitting
// work in Resource Manager mode. Callers must pre-normalize the values; the
// holder stores them as-is.
type ResourceGroupConfig struct {
	// Weight is the group's percentage share of node CPU, in [0, 100]. Used
	// directly as the heap weight and as the burst-bucket refill share
	// (Weight/100). Callers should set weights that sum to 100 across the
	// configured set; the holder does not enforce this.
	Weight uint32
	// MaxCPU=true forces canBurst regardless of bucket utilization. The bucket
	// is still refilled at Weight/100; MaxCPU only exempts the group from the
	// bucket-fullness gate. Within the same canBurst qualification, groups
	// remain ordered by used/weight.
	MaxCPU bool
}

// ResourceGroupConfigSet is the set of per-group configs keyed by groupKey.
// Once installed in the holder, callers must treat the map as read-only.
type ResourceGroupConfigSet map[groupKey]ResourceGroupConfig

// SafeFormat renders one entry per line, sorted by id, e.g.:
//
//	rg1 weight=80 maxCPU=true
//	rg2 weight=20 maxCPU=false
func (s ResourceGroupConfigSet) SafeFormat(w redact.SafePrinter, _ rune) {
	keys := make([]groupKey, 0, len(s))
	for k := range s {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool { return keys[i].id < keys[j].id })
	for _, k := range keys {
		cfg := s[k]
		w.Printf("%s weight=%d maxCPU=%t\n", k, cfg.Weight, cfg.MaxCPU)
	}
}

// String implements fmt.Stringer via SafeFormat.
func (s ResourceGroupConfigSet) String() string {
	return redact.StringWithoutMarkers(s)
}

// GetOrDefault returns the config for k if installed, otherwise the
// kind-appropriate fallback (rgKind: defaultRGGroupConfig; tenantKind:
// defaultTenantGroupConfig). Used by WorkQueue's lazy group creation: an
// Admit for a key without a corresponding groupInfo consults the set to
// populate weight and maxCPU on the new groupInfo (burstFrac is computed
// inline as Weight/100).
//
// TODO(wenyihu6): collapse to a single per-kind-agnostic fallback once we can
// align the rg and tenant defaults. The kind switch here is a transitional
// shape; ideally GetOrDefault returns one default that works for any key.
func (s ResourceGroupConfigSet) GetOrDefault(k groupKey) ResourceGroupConfig {
	if cfg, ok := s[k]; ok {
		return cfg
	}
	switch k.kind {
	case rgKind:
		return defaultRGGroupConfig
	case tenantKind:
		return defaultTenantGroupConfig
	default:
		panic(errors.AssertionFailedf("ResourceGroupConfigSet.GetOrDefault: invalid kind %s", k.kind))
	}
}

// defaultRMResourceGroupConfig seeds the holder until an explicit Set
// replaces it. The two ids match priorityToResourceGroupKey (high/low).
//
// TODO(wenyihu6): revisit weights once we have signal from real workloads.
var defaultRMResourceGroupConfig = ResourceGroupConfigSet{
	rgGroupKey(highResourceGroupID): {Weight: 80, MaxCPU: true},
	rgGroupKey(lowResourceGroupID):  {Weight: 20, MaxCPU: false},
}

// defaultRGGroupConfig is the safety fallback returned by GetOrDefault for
// rgKind keys not in the installed configuration. In steady state this is
// unreachable: the seed (defaultRMResourceGroupConfig) covers high/low. It
// exists to keep Admit's lazy-create path total — if a caller installs a
// config that omits a known rg ID, Admit gets a usable weight rather than a
// zero-weight group. Weight=20 mirrors the low default; MaxCPU=false keeps
// an unconfigured group from bypassing the burst-fullness gate.
//
// TODO(wenyihu6): once SQL DDL (CREATE/ALTER RESOURCE GROUP) is wired
// through, decide whether unknown rgKind IDs should be a hard error.
var defaultRGGroupConfig = ResourceGroupConfig{Weight: 20, MaxCPU: false}

// defaultTenantGroupConfig is the fallback for tenantKind keys: every tenant
// gets defaultGroupWeight, since per-tenant weights are no longer
// configurable. MaxCPU=false because tenants don't carry burst flags.
var defaultTenantGroupConfig = ResourceGroupConfig{Weight: defaultGroupWeight, MaxCPU: false}

// ResourceGroupConfigHolder owns the source-of-truth config set for RM mode.
// It is pure storage behind an RWMutex; reads (every Admit) vastly outnumber
// writes (config changes only).
type ResourceGroupConfigHolder struct {
	mu struct {
		syncutil.RWMutex
		config ResourceGroupConfigSet
	}
}

// newResourceGroupConfigHolder constructs a holder seeded with
// defaultRMResourceGroupConfig, so a fresh Snapshot returns the high/low
// hardcoded groups that WorkQueue applies on first RM-mode activation.
func newResourceGroupConfigHolder() *ResourceGroupConfigHolder {
	h := &ResourceGroupConfigHolder{}
	h.Set(defaultRMResourceGroupConfig)
	return h
}

// Set replaces the stored config wholesale. Keys absent from config are
// dropped.
//
// NB: caller may mutate config after Set returns; the input is copied.
func (h *ResourceGroupConfigHolder) Set(config ResourceGroupConfigSet) {
	cp := make(ResourceGroupConfigSet, len(config))
	for k, v := range config {
		cp[k] = v
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	h.mu.config = cp
}

// Snapshot returns the installed config map directly (no copy). The map is
// immutable post-install: a subsequent Set installs a fresh map rather than
// mutating in place, so prior snapshots remain stable.
func (h *ResourceGroupConfigHolder) Snapshot() ResourceGroupConfigSet {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.mu.config
}
