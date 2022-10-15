// Copyright 2022 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

import * as React from "react";

interface IconProps {
  className: string;
  viewBox?: string;
}

export function CircleFilled(props: IconProps): React.ReactElement {
  return (
    <svg {...props}>
      <circle cx="5" cy="5" r="5" />
    </svg>
  );
}
