// Copyright 2017 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

package storage

import (
	"context"
	"testing"

	"github.com/cockroachdb/cockroach/pkg/base"
	"github.com/cockroachdb/cockroach/pkg/settings/cluster"
	"github.com/cockroachdb/cockroach/pkg/storage/disk"
	"github.com/cockroachdb/cockroach/pkg/storage/fs"
	"github.com/cockroachdb/cockroach/pkg/testutils"
	"github.com/cockroachdb/cockroach/pkg/util/leaktest"
	"github.com/cockroachdb/cockroach/pkg/util/log"
	"github.com/cockroachdb/pebble/vfs"
)

func TestNewTempEngine(t *testing.T) {
	defer leaktest.AfterTest(t)()
	defer log.Scope(t).Close(t)

	// Create the temporary directory for the RocksDB engine.
	tempDir, tempDirCleanup := testutils.TempDir(t)
	defer tempDirCleanup()

	diskWriteStats := disk.NewWriteStatsManager(vfs.Default)
	db, filesystem, err := NewTempEngine(context.Background(), base.TempStorageConfig{
		Path:     tempDir,
		Settings: cluster.MakeTestingClusterSettings(),
	}, diskWriteStats)
	if err != nil {
		t.Fatalf("error encountered when invoking NewTempEngine: %+v", err)
	}
	defer db.Close()

	// Temp engine initialized with the temporary directory.
	if dir := filesystem.(*fs.Env).Dir; tempDir != dir {
		t.Fatalf("temp engine initialized with unexpected parent directory.\nexpected %s\nactual %s",
			tempDir, dir)
	}
}
