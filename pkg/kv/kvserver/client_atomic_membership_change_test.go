// Copyright 2019 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

package kvserver_test

import (
	"context"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/cockroachdb/cockroach/pkg/base"
	"github.com/cockroachdb/cockroach/pkg/kv/kvpb"
	"github.com/cockroachdb/cockroach/pkg/kv/kvserver"
	"github.com/cockroachdb/cockroach/pkg/raft"
	"github.com/cockroachdb/cockroach/pkg/raft/confchange"
	"github.com/cockroachdb/cockroach/pkg/raft/quorum"
	"github.com/cockroachdb/cockroach/pkg/raft/tracker"
	"github.com/cockroachdb/cockroach/pkg/roachpb"
	"github.com/cockroachdb/cockroach/pkg/testutils"
	"github.com/cockroachdb/cockroach/pkg/testutils/skip"
	"github.com/cockroachdb/cockroach/pkg/testutils/testcluster"
	"github.com/cockroachdb/cockroach/pkg/util/leaktest"
	"github.com/cockroachdb/cockroach/pkg/util/log"
	"github.com/cockroachdb/errors"
	"github.com/kr/pretty"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestAtomicReplicationChange is a simple smoke test for atomic membership
// changes.
func TestAtomicReplicationChange(t *testing.T) {
	defer leaktest.AfterTest(t)()
	defer log.Scope(t).Close(t)
	ctx := context.Background()

	var logRangeID atomic.Int64
	args := base.TestClusterArgs{
		ServerArgs: base.TestServerArgs{
			Knobs: base.TestingKnobs{
				Store: &kvserver.StoreTestingKnobs{
					RaftLogReadyRaftMuLocked: func(
						ctx context.Context, rangeID roachpb.RangeID, replID roachpb.ReplicaID, rd raft.Ready) bool {
						return logRangeID.Load() == int64(rangeID)
					},
				},
			},
		},
		ReplicationMode: base.ReplicationManual,
	}
	tc := testcluster.StartTestCluster(t, 6, args)
	defer tc.Stopper().Stop(ctx)

	// Create a range and put it on n1, n2, n3. Intentionally do this one at a
	// time so we're not using atomic replication changes yet.
	k := tc.ScratchRange(t)
	_, err := tc.AddVoters(k, tc.Target(1))
	require.NoError(t, err)
	desc, err := tc.AddVoters(k, tc.Target(2))
	require.NoError(t, err)

	runChange := func(expDesc roachpb.RangeDescriptor, chgs []kvpb.ReplicationChange) roachpb.RangeDescriptor {
		t.Helper()
		desc, err := tc.Servers[0].DB().AdminChangeReplicas(ctx, k, expDesc, chgs)
		require.NoError(t, err)

		return *desc
	}

	checkDesc := func(desc roachpb.RangeDescriptor, expStores ...roachpb.StoreID) {
		testutils.SucceedsSoon(t, func() error {
			var sawStores []roachpb.StoreID
			for _, s := range tc.Servers {
				r, _, _ := s.GetStores().(*kvserver.Stores).GetReplicaForRangeID(ctx, desc.RangeID)
				if r == nil {
					continue
				}
				if _, found := desc.GetReplicaDescriptor(r.StoreID()); !found {
					// There's a replica but it's not in the new descriptor, so
					// it should be replicaGC'ed soon.
					return errors.Errorf("%s should have been removed", r)
				}
				sawStores = append(sawStores, r.StoreID())
				// Check that in-mem descriptor of repl is up-to-date.
				if diff := pretty.Diff(&desc, r.Desc()); len(diff) > 0 {
					return errors.Errorf("diff(want, have):\n%s", strings.Join(diff, "\n"))
				}
				// Check that conf state is up to date. This can fail even though
				// the descriptor already matches since the descriptor is updated
				// a hair earlier.
				cfg := quorum.MakeEmptyConfig()
				cfg, _, err = confchange.Restore(confchange.Changer{
					ProgressMap:      tracker.MakeEmptyProgressMap(),
					Config:           cfg,
					MaxInflight:      1,
					MaxInflightBytes: 0,
					LastIndex:        1,
				}, desc.Replicas().ConfState())
				require.NoError(t, err)
				act := r.RaftStatus().Config.Voters
				if diff := pretty.Diff(cfg.Voters, act); len(diff) > 0 {
					return errors.Errorf("diff(exp,act):\n%s", strings.Join(diff, "\n"))
				}
			}
			assert.Equal(t, expStores, sawStores)
			return nil
		})
	}

	// Run a fairly general change.
	desc = runChange(desc, []kvpb.ReplicationChange{
		{ChangeType: roachpb.ADD_VOTER, Target: tc.Target(3)},
		{ChangeType: roachpb.ADD_VOTER, Target: tc.Target(5)},
		{ChangeType: roachpb.REMOVE_VOTER, Target: tc.Target(2)},
		{ChangeType: roachpb.ADD_VOTER, Target: tc.Target(4)},
	})

	// Replicas should now live on all stores except s3.
	checkDesc(desc, 1, 2, 4, 5, 6)

	// Start logging all raft Ready handling to diagnose issues such as:
	//
	// https://github.com/cockroachdb/cockroach/issues/145946
	//
	// We don't do this under Duress since this logging is fairly
	// verbose and thus expensive.
	if !skip.Duress() {
		logRangeID.Store(int64(desc.RangeID))
	}

	// Transfer the lease to s5.
	require.NoError(t, tc.TransferRangeLease(desc, tc.Target(4)))

	// Rebalance back down all the way.
	desc = runChange(desc, []kvpb.ReplicationChange{
		{ChangeType: roachpb.REMOVE_VOTER, Target: tc.Target(0)},
		{ChangeType: roachpb.REMOVE_VOTER, Target: tc.Target(1)},
		{ChangeType: roachpb.REMOVE_VOTER, Target: tc.Target(3)},
		{ChangeType: roachpb.REMOVE_VOTER, Target: tc.Target(5)},
	})

	// Only a lone voter on s5 should be left over.
	checkDesc(desc, 5)
}
