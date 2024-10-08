// Copyright 2021 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

package grpcutils

import (
	"context"

	"github.com/gogo/protobuf/types"
)

// TestServerImpl backs the Test service.
type TestServerImpl struct {
	UU func(context.Context, *types.Any) (*types.Any, error) // UnaryUnary
	US func(*types.Any, GRPCTest_UnaryStreamServer) error    // UnaryStream
	SU func(server GRPCTest_StreamUnaryServer) error         // StreamUnary
	SS func(server GRPCTest_StreamStreamServer) error        // StreamStream
}

var _ GRPCTestServer = (*TestServerImpl)(nil)

// UnaryUnary implements GRPCTestServer.
func (s *TestServerImpl) UnaryUnary(ctx context.Context, any *types.Any) (*types.Any, error) {
	return s.UU(ctx, any)
}

// UnaryStream implements GRPCTestServer.
func (s *TestServerImpl) UnaryStream(any *types.Any, server GRPCTest_UnaryStreamServer) error {
	return s.US(any, server)
}

// StreamUnary implements GRPCTestServer.
func (s *TestServerImpl) StreamUnary(server GRPCTest_StreamUnaryServer) error {
	return s.SU(server)
}

// StreamStream implements GRPCTestServer.
func (s *TestServerImpl) StreamStream(server GRPCTest_StreamStreamServer) error {
	return s.SS(server)
}
