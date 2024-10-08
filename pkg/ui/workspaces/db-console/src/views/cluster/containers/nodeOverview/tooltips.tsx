// Copyright 2018 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

import React from "react";

import { Tooltip, Anchor } from "src/components";
import { TooltipProps } from "src/components/tooltip/tooltip";
import {
  keyValuePairs,
  writeIntents,
  metaRanges,
  clusterStore,
  capacityMetrics,
} from "src/util/docs";

export type CellTooltipProps = {
  nodeName?: string;
} & TooltipProps;

export const LiveBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of logical bytes stored in live &nbsp;
          <Anchor href={keyValuePairs} target="_blank">
            key-value pairs
          </Anchor>{" "}
          &nbsp; on node {props.nodeName || "NodeName"}.
        </p>
        <p>Live data excludes historical and deleted data.</p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const KeyBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of bytes stored in keys on node {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const ValueBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of bytes stored in values on node{" "}
          {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const MVCCRangeKeyBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of bytes stored in MVCC range keys on node{" "}
          {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const MVCCRangeValueBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of bytes stored in MVCC range values on node{" "}
          {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const IntentBytesTooltip: React.FC<TooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of bytes stored in &nbsp;
          <Anchor href={writeIntents} target="_blank">
            write intents
          </Anchor>{" "}
          &nbsp; of uncommitted values.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const SystemBytesTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Number of physical bytes stored in &nbsp;
          <Anchor href={metaRanges} target="_blank">
            system key-value pairs
          </Anchor>{" "}
          &nbsp; on node {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const NodeUsedCapacityTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Disk space in use by CockroachDB data on node{" "}
          {props.nodeName || "NodeName"}.
        </p>
        <p>
          This excludes the Cockroach binary, operating system, and other system
          files.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const NodeAvailableCapacityTooltip: React.FC<
  CellTooltipProps
> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>
          Free disk space available to CockroachDB data on node{" "}
          {props.nodeName || "NodeName"}.
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);

export const NodeMaximumCapacityTooltip: React.FC<CellTooltipProps> = props => (
  <Tooltip
    {...props}
    placement="bottom"
    title={
      <div className="tooltip__table--title">
        <p>Maximum store size of node {props.nodeName || "NodeName"}.</p>
        <p>
          This value may be explicitly set per node using &nbsp;
          <Anchor href={clusterStore} target="_blank">
            --store
          </Anchor>{" "}
          &nbsp; If a store size has not been set, this metric displays the
          actual disk capacity.
        </p>
        <p>
          <Anchor href={capacityMetrics} target="_blank">
            How is this metric calculated?
          </Anchor>
        </p>
      </div>
    }
  >
    {props.children}
  </Tooltip>
);
