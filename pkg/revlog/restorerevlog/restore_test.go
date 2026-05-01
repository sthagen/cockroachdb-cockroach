// Copyright 2026 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

package restorerevlog

import (
	"testing"

	"github.com/cockroachdb/cockroach/pkg/revlog/revlogpb"
	"github.com/cockroachdb/cockroach/pkg/util/hlc"
	"github.com/cockroachdb/cockroach/pkg/util/leaktest"
	"github.com/stretchr/testify/require"
)

func makeTick(id int) revlogpb.Manifest {
	return revlogpb.Manifest{
		TickStart: hlc.Timestamp{WallTime: int64(id) * 1e10},
		TickEnd:   hlc.Timestamp{WallTime: int64(id+1) * 1e10},
	}
}

func makeTicks(n int) []revlogpb.Manifest {
	ticks := make([]revlogpb.Manifest, n)
	for i := range ticks {
		ticks[i] = makeTick(i)
	}
	return ticks
}

func TestAssignTicksToNodes(t *testing.T) {
	defer leaktest.AfterTest(t)()
	t.Run("even distribution", func(t *testing.T) {
		ticks := makeTicks(12)
		assignments := AssignTicksToNodes(ticks, 3)
		require.Len(t, assignments, 3)
		for i, a := range assignments {
			require.Len(t, a, 4, "node %d", i)
		}
	})

	t.Run("uneven distribution", func(t *testing.T) {
		ticks := makeTicks(10)
		assignments := AssignTicksToNodes(ticks, 3)
		require.Len(t, assignments, 3)
		// 10 ticks across 3 nodes: one gets 4, two get 3.
		counts := []int{
			len(assignments[0]),
			len(assignments[1]),
			len(assignments[2]),
		}
		total := 0
		for _, c := range counts {
			total += c
			require.True(t, c == 3 || c == 4,
				"expected 3 or 4, got %d", c)
		}
		require.Equal(t, 10, total)
	})

	t.Run("single node", func(t *testing.T) {
		ticks := makeTicks(5)
		assignments := AssignTicksToNodes(ticks, 1)
		require.Len(t, assignments, 1)
		require.Len(t, assignments[0], 5)
	})

	t.Run("empty ticks", func(t *testing.T) {
		assignments := AssignTicksToNodes(nil, 3)
		require.Len(t, assignments, 3)
		for i, a := range assignments {
			require.Empty(t, a, "node %d", i)
		}
	})

	t.Run("more nodes than ticks", func(t *testing.T) {
		ticks := makeTicks(2)
		assignments := AssignTicksToNodes(ticks, 5)
		require.Len(t, assignments, 5)
		nonEmpty := 0
		for _, a := range assignments {
			nonEmpty += len(a)
		}
		require.Equal(t, 2, nonEmpty)
	})

	t.Run("no loss or duplication", func(t *testing.T) {
		ticks := makeTicks(20)
		expected := make(map[int64]struct{}, len(ticks))
		for _, tick := range ticks {
			expected[tick.TickEnd.WallTime] = struct{}{}
		}

		assignments := AssignTicksToNodes(ticks, 4)
		got := make(map[int64]struct{})
		for _, nodeAssign := range assignments {
			for _, tick := range nodeAssign {
				_, dup := got[tick.TickEnd.WallTime]
				require.False(t, dup,
					"duplicate tick %v", tick.TickEnd)
				got[tick.TickEnd.WallTime] = struct{}{}
			}
		}
		require.Equal(t, expected, got)
	})
}
