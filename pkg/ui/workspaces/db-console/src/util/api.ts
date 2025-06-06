// Copyright 2018 The Cockroach Authors.
//
// Use of this software is governed by the CockroachDB Software License
// included in the /LICENSE file.

/**
 * This module contains all the REST endpoints for communicating with the admin UI.
 */

import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import map from "lodash/map";
import moment from "moment-timezone";

import * as protos from "src/js/protos";
import { FixLong } from "src/util/fixLong";
import { propsToQueryString } from "src/util/query";

export type LocationsRequestMessage =
  protos.cockroach.server.serverpb.LocationsRequest;
export type LocationsResponseMessage =
  protos.cockroach.server.serverpb.LocationsResponse;

export type NodesRequestMessage = protos.cockroach.server.serverpb.NodesRequest;
export type NodesResponseExternalMessage =
  protos.cockroach.server.serverpb.NodesResponseExternal;

export type GetUIDataRequestMessage =
  protos.cockroach.server.serverpb.GetUIDataRequest;
export type GetUIDataResponseMessage =
  protos.cockroach.server.serverpb.GetUIDataResponse;

export type SetUIDataRequestMessage =
  protos.cockroach.server.serverpb.SetUIDataRequest;
export type SetUIDataResponseMessage =
  protos.cockroach.server.serverpb.SetUIDataResponse;

export type RaftDebugRequestMessage =
  protos.cockroach.server.serverpb.RaftDebugRequest;
export type RaftDebugResponseMessage =
  protos.cockroach.server.serverpb.RaftDebugResponse;

export type TimeSeriesQueryRequestMessage =
  protos.cockroach.ts.tspb.TimeSeriesQueryRequest;
export type TimeSeriesQueryResponseMessage =
  protos.cockroach.ts.tspb.TimeSeriesQueryResponse;

export type HealthRequestMessage =
  protos.cockroach.server.serverpb.HealthRequest;
export type HealthResponseMessage =
  protos.cockroach.server.serverpb.HealthResponse;

export type ClusterRequestMessage =
  protos.cockroach.server.serverpb.ClusterRequest;
export type ClusterResponseMessage =
  protos.cockroach.server.serverpb.ClusterResponse;

export type TableStatsRequestMessage =
  protos.cockroach.server.serverpb.TableStatsRequest;

export type IndexStatsRequestMessage =
  protos.cockroach.server.serverpb.TableIndexStatsRequest;
export type IndexStatsResponseMessage =
  protos.cockroach.server.serverpb.TableIndexStatsResponse;

export type NonTableStatsRequestMessage =
  protos.cockroach.server.serverpb.NonTableStatsRequest;
export type NonTableStatsResponseMessage =
  protos.cockroach.server.serverpb.NonTableStatsResponse;

export type LogsRequestMessage = protos.cockroach.server.serverpb.LogsRequest;
export type LogEntriesResponseMessage =
  protos.cockroach.server.serverpb.LogEntriesResponse;

export type LivenessRequestMessage =
  protos.cockroach.server.serverpb.LivenessRequest;
export type LivenessResponseMessage =
  protos.cockroach.server.serverpb.LivenessResponse;

export type JobsRequestMessage = protos.cockroach.server.serverpb.JobsRequest;
export type JobsResponseMessage = protos.cockroach.server.serverpb.JobsResponse;

export type JobRequestMessage = protos.cockroach.server.serverpb.JobRequest;
export type JobResponseMessage = protos.cockroach.server.serverpb.JobResponse;

export type ListJobProfilerExecutionDetailsRequestMessage =
  protos.cockroach.server.serverpb.ListJobProfilerExecutionDetailsRequest;
export type ListJobProfilerExecutionDetailsResponseMessage =
  protos.cockroach.server.serverpb.ListJobProfilerExecutionDetailsResponse;

export type QueryPlanRequestMessage =
  protos.cockroach.server.serverpb.QueryPlanRequest;
export type QueryPlanResponseMessage =
  protos.cockroach.server.serverpb.QueryPlanResponse;

export type ProblemRangesRequestMessage =
  protos.cockroach.server.serverpb.ProblemRangesRequest;
export type ProblemRangesResponseMessage =
  protos.cockroach.server.serverpb.ProblemRangesResponse;

export type CertificatesRequestMessage =
  protos.cockroach.server.serverpb.CertificatesRequest;
export type CertificatesResponseMessage =
  protos.cockroach.server.serverpb.CertificatesResponse;

export type RangeRequestMessage = protos.cockroach.server.serverpb.RangeRequest;
export type RangeResponseMessage =
  protos.cockroach.server.serverpb.RangeResponse;

export type AllocatorRangeRequestMessage =
  protos.cockroach.server.serverpb.AllocatorRangeRequest;
export type AllocatorRangeResponseMessage =
  protos.cockroach.server.serverpb.AllocatorRangeResponse;

export type RangeLogRequestMessage =
  protos.cockroach.server.serverpb.RangeLogRequest;
export type RangeLogResponseMessage =
  protos.cockroach.server.serverpb.RangeLogResponse;

export type SettingsRequestMessage =
  protos.cockroach.server.serverpb.SettingsRequest;
export type SettingsResponseMessage =
  protos.cockroach.server.serverpb.SettingsResponse;

export type SessionsRequestMessage =
  protos.cockroach.server.serverpb.ListSessionsRequest;
export type SessionsResponseMessage =
  protos.cockroach.server.serverpb.ListSessionsResponse;

export type CancelSessionRequestMessage =
  protos.cockroach.server.serverpb.CancelSessionRequest;
export type CancelSessionResponseMessage =
  protos.cockroach.server.serverpb.CancelSessionResponse;

export type CancelQueryRequestMessage =
  protos.cockroach.server.serverpb.CancelQueryRequest;
export type CancelQueryResponseMessage =
  protos.cockroach.server.serverpb.CancelQueryResponse;

export type UserLoginRequestMessage =
  protos.cockroach.server.serverpb.UserLoginRequest;
export type UserLoginResponseMessage =
  protos.cockroach.server.serverpb.UserLoginResponse;

export type StoresRequestMessage =
  protos.cockroach.server.serverpb.StoresRequest;
export type StoresResponseMessage =
  protos.cockroach.server.serverpb.StoresResponse;

export type UserLogoutResponseMessage =
  protos.cockroach.server.serverpb.UserLogoutResponse;

export type StatementsResponseMessage =
  protos.cockroach.server.serverpb.StatementsResponse;
export type StatementDetailsResponseMessage =
  protos.cockroach.server.serverpb.StatementDetailsResponse;

export type DataDistributionResponseMessage =
  protos.cockroach.server.serverpb.DataDistributionResponse;

export type EnqueueRangeRequestMessage =
  protos.cockroach.server.serverpb.EnqueueRangeRequest;
export type EnqueueRangeResponseMessage =
  protos.cockroach.server.serverpb.EnqueueRangeResponse;

export type MetricMetadataRequestMessage =
  protos.cockroach.server.serverpb.MetricMetadataRequest;
export type MetricMetadataResponseMessage =
  protos.cockroach.server.serverpb.MetricMetadataResponse;

export type StatementDetailsRequestMessage =
  protos.cockroach.server.serverpb.StatementDetailsRequest;

export type ResetSQLStatsRequestMessage =
  protos.cockroach.server.serverpb.ResetSQLStatsRequest;
export type ResetSQLStatsResponseMessage =
  protos.cockroach.server.serverpb.ResetSQLStatsResponse;

export type ResetIndexUsageStatsRequestMessage =
  protos.cockroach.server.serverpb.ResetIndexUsageStatsRequest;
export type ResetIndexUsageStatsResponseMessage =
  protos.cockroach.server.serverpb.ResetIndexUsageStatsResponse;

export type UserSQLRolesRequestMessage =
  protos.cockroach.server.serverpb.UserSQLRolesRequest;
export type UserSQLRolesResponseMessage =
  protos.cockroach.server.serverpb.UserSQLRolesResponse;

export type HotRangesRequestMessage =
  protos.cockroach.server.serverpb.HotRangesRequest;
export type HotRangesV2ResponseMessage =
  protos.cockroach.server.serverpb.HotRangesResponseV2;

export type KeyVisualizerSamplesRequestMessage =
  protos.cockroach.server.serverpb.KeyVisSamplesRequest;
export type KeyVisualizerSamplesResponseMessage =
  protos.cockroach.server.serverpb.KeyVisSamplesResponse;

export type ListTenantsRequestMessage =
  protos.cockroach.server.serverpb.ListTenantsRequest;
export type ListTenantsResponseMessage =
  protos.cockroach.server.serverpb.ListTenantsResponse;

export type NetworkConnectivityRequest =
  protos.cockroach.server.serverpb.NetworkConnectivityRequest;
export type NetworkConnectivityResponse =
  protos.cockroach.server.serverpb.NetworkConnectivityResponse;

export type GetThrottlingMetadataRequest =
  protos.cockroach.server.serverpb.GetThrottlingMetadataRequest;
export type GetThrottlingMetadataResponse =
  protos.cockroach.server.serverpb.GetThrottlingMetadataResponse;

// API constants

export const API_PREFIX = "_admin/v1";
export const STATUS_PREFIX = "_status";

const ResponseError = protos.cockroach.server.serverpb.ResponseError;

export class TimeoutError extends Error {
  timeout: moment.Duration;
  constructor(timeout: moment.Duration) {
    const message = `Promise timed out after ${timeout.asMilliseconds()} ms`;
    super(message);

    this.name = this.constructor.name;
    this.timeout = timeout;
  }
}

// HELPER FUNCTIONS

// Inspired by https://github.com/github/fetch/issues/175
//
// withTimeout wraps a promise in a timeout.
export function withTimeout<T>(
  promise: Promise<T>,
  timeout?: moment.Duration,
): Promise<T> {
  if (timeout) {
    return new Promise<T>((resolve, reject) => {
      setTimeout(
        () => reject(new TimeoutError(timeout)),
        timeout.asMilliseconds(),
      );
      promise.then(resolve, reject);
    });
  } else {
    return promise;
  }
}

interface TRequest {
  constructor: {
    encode(message: TRequest, writer?: protobuf.Writer): protobuf.Writer;
  };
  toObject(): { [k: string]: any };
}

export function toArrayBuffer(encodedRequest: Uint8Array): ArrayBuffer {
  return encodedRequest.buffer.slice(
    encodedRequest.byteOffset,
    encodedRequest.byteOffset + encodedRequest.byteLength,
  );
}

export class RequestError extends Error {
  status: number;
  constructor(statusText: string, status: number, message?: string) {
    super(statusText);
    this.status = status;
    this.name = "RequestError";
    this.message = message;
  }
}

// timeoutFetch is a wrapper around fetch that provides timeout and protocol
// buffer marshaling and unmarshalling.
//
// This function is intended for use with generated protocol buffers. In
// particular, TResponse$Properties is a generated interface that describes the JSON
// representation of the response, while TRequest and TResponse
// are generated interfaces which are implemented by the protocol buffer
// objects themselves. TResponseBuilder is an interface implemented by
// the builder objects provided at runtime by protobuf.js.
function timeoutFetch<
  TResponse$Properties,
  TResponse,
  TResponseBuilder extends {
    new (properties?: TResponse$Properties): TResponse;
    encode(
      message: TResponse$Properties,
      writer?: protobuf.Writer,
    ): protobuf.Writer;
    decode(reader: protobuf.Reader | Uint8Array, length?: number): TResponse;
  },
>(
  builder: TResponseBuilder,
  url: string,
  req: TRequest = null,
  timeout: moment.Duration = moment.duration(30, "s"),
): Promise<TResponse> {
  const params: RequestInit = {
    headers: {
      Accept: "application/x-protobuf",
      "Content-Type": "application/x-protobuf",
      "Grpc-Timeout": timeout ? timeout.asMilliseconds() + "m" : undefined,
    },
    credentials: "same-origin",
  };

  if (req) {
    const encodedRequest = req.constructor.encode(req).finish();
    params.method = "POST";
    params.body = toArrayBuffer(encodedRequest);
  }

  return withTimeout(fetch(url, params), timeout).then(res => {
    if (!res.ok) {
      return res.arrayBuffer().then(buffer => {
        let respError;
        try {
          respError = ResponseError.decode(new Uint8Array(buffer));
        } catch {
          respError = new ResponseError({ error: res.statusText });
        }
        throw new RequestError(res.statusText, res.status, respError.error);
      });
    }
    return res
      .arrayBuffer()
      .then(buffer => builder.decode(new Uint8Array(buffer)));
  });
}

export type APIRequestFn<TReq, TResponse> = (
  req: TReq,
  timeout?: moment.Duration,
) => Promise<TResponse>;

/**
 * ENDPOINTS
 */

const serverpb = protos.cockroach.server.serverpb;
const tspb = protos.cockroach.ts.tspb;

// getUIData gets UI data
export function getUIData(
  req: GetUIDataRequestMessage,
  timeout?: moment.Duration,
): Promise<GetUIDataResponseMessage> {
  const queryString = map(
    req.keys,
    key => "keys=" + encodeURIComponent(key),
  ).join("&");
  return timeoutFetch(
    serverpb.GetUIDataResponse,
    `${API_PREFIX}/uidata?${queryString}`,
    null,
    timeout,
  );
}

// setUIData sets UI data
export function setUIData(
  req: SetUIDataRequestMessage,
  timeout?: moment.Duration,
): Promise<SetUIDataResponseMessage> {
  return timeoutFetch(
    serverpb.SetUIDataResponse,
    `${API_PREFIX}/uidata`,
    req as any,
    timeout,
  );
}

export function getLocations(
  _req: LocationsRequestMessage,
  timeout?: moment.Duration,
): Promise<LocationsResponseMessage> {
  return timeoutFetch(
    serverpb.LocationsResponse,
    `${API_PREFIX}/locations`,
    null,
    timeout,
  );
}

// getNodes gets node data
export function getNodesUI(
  _req: NodesRequestMessage,
  timeout?: moment.Duration,
): Promise<NodesResponseExternalMessage> {
  return timeoutFetch(
    serverpb.NodesResponseExternal,
    `${STATUS_PREFIX}/nodes_ui`,
    null,
    timeout,
  );
}

export function raftDebug(
  _req: RaftDebugRequestMessage,
): Promise<RaftDebugResponseMessage> {
  // NB: raftDebug intentionally does not pass a timeout through.
  return timeoutFetch(serverpb.RaftDebugResponse, `${STATUS_PREFIX}/raft`);
}

// queryTimeSeries queries for time series data
export function queryTimeSeries(
  req: TimeSeriesQueryRequestMessage,
  timeout?: moment.Duration,
): Promise<TimeSeriesQueryResponseMessage> {
  return timeoutFetch(
    tspb.TimeSeriesQueryResponse,
    `ts/query`,
    req as any,
    timeout,
  );
}

// getHealth gets health data
export function getHealth(
  _req: HealthRequestMessage,
  timeout?: moment.Duration,
): Promise<HealthResponseMessage> {
  return timeoutFetch(
    serverpb.HealthResponse,
    `${API_PREFIX}/health`,
    null,
    timeout,
  );
}

export const jobsTimeoutErrorMessage = "Unable to retrieve the Jobs table.";

export function getJobs(
  req: JobsRequestMessage,
  timeout?: moment.Duration,
): Promise<JobsResponseMessage> {
  const url = `${API_PREFIX}/jobs?status=${req.status}&type=${req.type}&limit=${req.limit}`;
  return timeoutFetch(serverpb.JobsResponse, url, null, timeout).then(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (response: JobsResponseMessage) => response,
    (err: Error) => {
      if (err instanceof TimeoutError) {
        // eslint-disable-next-line no-console
        console.error(
          `Jobs page time out because attempt to retrieve jobs exceeded ${err.timeout.asMilliseconds()}ms.`,
          `URL: ${url}. Request: ${JSON.stringify(req)}`,
        );
        throw new Error(jobsTimeoutErrorMessage);
      } else {
        throw err;
      }
    },
  );
}

export function getJob(
  req: JobRequestMessage,
  timeout?: moment.Duration,
): Promise<JobResponseMessage> {
  return timeoutFetch(
    serverpb.JobResponse,
    `${API_PREFIX}/jobs/${req.job_id}`,
    null,
    timeout,
  );
}

export function listExecutionDetailFiles(
  req: ListJobProfilerExecutionDetailsRequestMessage,
  timeout?: moment.Duration,
): Promise<ListJobProfilerExecutionDetailsResponseMessage> {
  return timeoutFetch(
    serverpb.ListJobProfilerExecutionDetailsResponse,
    `${STATUS_PREFIX}/list_job_profiler_execution_details/${req.job_id}`,
    null,
    timeout,
  );
}

// getCluster gets info about the cluster
export function getCluster(
  _req: ClusterRequestMessage,
  timeout?: moment.Duration,
): Promise<ClusterResponseMessage> {
  return timeoutFetch(
    serverpb.ClusterResponse,
    `${API_PREFIX}/cluster`,
    null,
    timeout,
  );
}

// getIndexStats gets detailed stats about the current table's index usage statistics.
export function getIndexStats(
  req: IndexStatsRequestMessage,
  timeout?: moment.Duration,
): Promise<IndexStatsResponseMessage> {
  const promiseErr = IsValidateUriName(req.database, req.table);
  if (promiseErr) {
    return promiseErr;
  }

  return timeoutFetch(
    serverpb.TableIndexStatsResponse,
    `${STATUS_PREFIX}/databases/${EncodeUriName(
      req.database,
    )}/tables/${EncodeUriName(req.table)}/indexstats`,
    null,
    timeout,
  );
}

// getNonTableStats gets detailed stats about non-table data ranges on the
// cluster.
export function getNonTableStats(
  _req: NonTableStatsRequestMessage,
  timeout?: moment.Duration,
): Promise<NonTableStatsResponseMessage> {
  return timeoutFetch(
    serverpb.NonTableStatsResponse,
    `${API_PREFIX}/nontablestats`,
    null,
    timeout,
  );
}

// TODO (maxlang): add filtering
// getLogs gets the logs for a specific node
export function getLogs(
  req: LogsRequestMessage,
  timeout?: moment.Duration,
): Promise<LogEntriesResponseMessage> {
  return timeoutFetch(
    serverpb.LogEntriesResponse,
    `${STATUS_PREFIX}/logs/${req.node_id}`,
    null,
    timeout,
  );
}

// getLiveness gets cluster liveness information from the current node.
export function getLiveness(
  _req: LivenessRequestMessage,
  timeout?: moment.Duration,
): Promise<LivenessResponseMessage> {
  return timeoutFetch(
    serverpb.LivenessResponse,
    `${API_PREFIX}/liveness`,
    null,
    timeout,
  );
}

// getQueryPlan gets physical query plan JSON for the provided query.
export function getQueryPlan(
  req: QueryPlanRequestMessage,
  timeout?: moment.Duration,
): Promise<QueryPlanResponseMessage> {
  return timeoutFetch(
    serverpb.QueryPlanResponse,
    `${API_PREFIX}/queryplan?query=${encodeURIComponent(req.query)}`,
    null,
    timeout,
  );
}

// getProblemRanges returns information needed by the problem range debug page.
export function getProblemRanges(
  req: ProblemRangesRequestMessage,
  timeout?: moment.Duration,
): Promise<ProblemRangesResponseMessage> {
  const query = !isEmpty(req.node_id) ? `?node_id=${req.node_id}` : "";
  return timeoutFetch(
    serverpb.ProblemRangesResponse,
    `${STATUS_PREFIX}/problemranges${query}`,
    null,
    timeout,
  );
}

// getCertificates returns information about a node's certificates.
export function getCertificates(
  req: CertificatesRequestMessage,
  timeout?: moment.Duration,
): Promise<CertificatesResponseMessage> {
  return timeoutFetch(
    serverpb.CertificatesResponse,
    `${STATUS_PREFIX}/certificates/${req.node_id}`,
    null,
    timeout,
  );
}

// getRange returns information about a range form all nodes.
export function getRange(
  req: RangeRequestMessage,
  timeout?: moment.Duration,
): Promise<RangeResponseMessage> {
  return timeoutFetch(
    serverpb.RangeResponse,
    `${STATUS_PREFIX}/range/${req.range_id}`,
    null,
    timeout,
  );
}

// getAllocatorRange returns simulated Allocator info for the requested range
export function getAllocatorRange(
  req: AllocatorRangeRequestMessage,
  timeout?: moment.Duration,
): Promise<AllocatorRangeResponseMessage> {
  return timeoutFetch(
    serverpb.AllocatorRangeResponse,
    `${STATUS_PREFIX}/allocator/range/${req.range_id}`,
    null,
    timeout,
  );
}

// getRangeLog returns the range log for all ranges or a specific range
export function getRangeLog(
  req: RangeLogRequestMessage,
  timeout?: moment.Duration,
): Promise<RangeLogResponseMessage> {
  const rangeID = FixLong(req.range_id);
  const rangeIDQuery = rangeID.eq(0) ? "" : `/${rangeID.toString()}`;
  const limit = !isNil(req.limit) ? `?limit=${req.limit}` : "";
  return timeoutFetch(
    serverpb.RangeLogResponse,
    `${API_PREFIX}/rangelog${rangeIDQuery}${limit}`,
    null,
    timeout,
  );
}

// getSettings gets all cluster settings. We request unredacted_values, which will attempt
// to obtain all values from the server. The server will only accept to do so if
// the user also happens to have admin privilege.
export function getSettings(
  _req: SettingsRequestMessage,
  timeout?: moment.Duration,
): Promise<SettingsResponseMessage> {
  return timeoutFetch(
    serverpb.SettingsResponse,
    `${API_PREFIX}/settings?unredacted_values=true`,
    null,
    timeout,
  );
}

// getSessions gets all cluster sessions.
export function getSessions(
  _req: SessionsRequestMessage,
  timeout?: moment.Duration,
): Promise<SessionsResponseMessage> {
  return timeoutFetch(
    serverpb.ListSessionsResponse,
    `${STATUS_PREFIX}/sessions`,
    null,
    timeout,
  );
}

// cancelSession cancels the session with the given id on the given node.
export function terminateSession(
  req: CancelSessionRequestMessage,
  timeout?: moment.Duration,
): Promise<CancelSessionResponseMessage> {
  return timeoutFetch(
    serverpb.CancelSessionResponse,
    `${STATUS_PREFIX}/cancel_session/${req.node_id}`,
    req as any,
    timeout,
  );
}

// cancelQuery cancels the query with the given id on the given node.
export function terminateQuery(
  req: CancelQueryRequestMessage,
  timeout?: moment.Duration,
): Promise<CancelQueryResponseMessage> {
  return timeoutFetch(
    serverpb.CancelQueryResponse,
    `${STATUS_PREFIX}/cancel_query/${req.node_id}`,
    req as any,
    timeout,
  );
}

export function userLogin(
  req: UserLoginRequestMessage,
  timeout?: moment.Duration,
): Promise<UserLoginResponseMessage> {
  return timeoutFetch(serverpb.UserLoginResponse, `login`, req as any, timeout);
}

export function userLogout(
  timeout?: moment.Duration,
): Promise<UserLogoutResponseMessage> {
  return timeoutFetch(serverpb.UserLogoutResponse, `logout`, null, timeout);
}

// getStores returns information about a node's stores.
export function getStores(
  req: StoresRequestMessage,
  timeout?: moment.Duration,
): Promise<StoresResponseMessage> {
  return timeoutFetch(
    serverpb.StoresResponse,
    `${STATUS_PREFIX}/stores/${req.node_id}`,
    null,
    timeout,
  );
}

// getStatementDetails returns the statistics about the selected statement.
export function getStatementDetails(
  req: StatementDetailsRequestMessage,
  timeout?: moment.Duration,
): Promise<StatementDetailsResponseMessage> {
  let queryStr = propsToQueryString({
    start: req.start.toInt(),
    end: req.end.toInt(),
  });
  for (const app of req.app_names) {
    queryStr += `&appNames=${encodeURIComponent(app)}`;
  }
  return timeoutFetch(
    serverpb.StatementDetailsResponse,
    `${STATUS_PREFIX}/stmtdetails/${req.fingerprint_id}?${queryStr}`,
    null,
    timeout,
  );
}

// getDataDistribution returns information about how replicas are distributed across nodes.
export function getDataDistribution(
  timeout?: moment.Duration,
): Promise<DataDistributionResponseMessage> {
  return timeoutFetch(
    serverpb.DataDistributionResponse,
    `${API_PREFIX}/data_distribution`,
    null,
    timeout,
  );
}

export function enqueueRange(
  req: EnqueueRangeRequestMessage,
  timeout?: moment.Duration,
): Promise<EnqueueRangeResponseMessage> {
  return timeoutFetch(
    serverpb.EnqueueRangeResponse,
    `${API_PREFIX}/enqueue_range`,
    req as any,
    timeout,
  );
}

export function getAllMetricMetadata(
  _req: MetricMetadataRequestMessage = null,
  timeout?: moment.Duration,
): Promise<MetricMetadataResponseMessage> {
  return timeoutFetch(
    serverpb.MetricMetadataResponse,
    `${API_PREFIX}/metricmetadata`,
    null,
    timeout,
  );
}

export function resetSQLStats(
  req: ResetSQLStatsRequestMessage,
  timeout?: moment.Duration,
): Promise<ResetSQLStatsResponseMessage> {
  return timeoutFetch(
    serverpb.ResetSQLStatsResponse,
    `${STATUS_PREFIX}/resetsqlstats`,
    req as any,
    timeout,
  );
}

// resetIndexUsageStats refreshes all index usage stats for all tables.
export function resetIndexUsageStats(
  req: ResetIndexUsageStatsRequestMessage,
  timeout?: moment.Duration,
): Promise<ResetIndexUsageStatsResponseMessage> {
  return timeoutFetch(
    serverpb.ResetIndexUsageStatsResponse,
    `${STATUS_PREFIX}/resetindexusagestats`,
    req as any,
    timeout,
  );
}

export function getUserSQLRoles(
  req: UserSQLRolesRequestMessage,
  timeout?: moment.Duration,
): Promise<UserSQLRolesResponseMessage> {
  return timeoutFetch(
    serverpb.UserSQLRolesResponse,
    `${STATUS_PREFIX}/sqlroles`,
    req as any,
    timeout,
  );
}

export function getHotRanges(
  req: HotRangesRequestMessage,
  timeout?: moment.Duration,
): Promise<HotRangesV2ResponseMessage> {
  return timeoutFetch(
    serverpb.HotRangesResponseV2,
    `${STATUS_PREFIX}/v2/hotranges`,
    req as any,
    timeout,
  );
}

export function getKeyVisualizerSamples(
  req: KeyVisualizerSamplesRequestMessage,
  timeout?: moment.Duration,
): Promise<KeyVisualizerSamplesResponseMessage> {
  return timeoutFetch(
    serverpb.KeyVisSamplesResponse,
    `${STATUS_PREFIX}/keyvissamples`,
    req as any,
    timeout,
  );
}

export function getTenants(
  req: ListTenantsRequestMessage,
  timeout?: moment.Duration,
): Promise<ListTenantsResponseMessage> {
  return timeoutFetch(
    serverpb.ListTenantsResponse,
    `${API_PREFIX}/tenants`,
    req as any,
    timeout,
  );
}

export function getNetworkConnectivity(
  req: NetworkConnectivityRequest,
  timeout?: moment.Duration,
): Promise<NetworkConnectivityResponse> {
  return timeoutFetch(
    serverpb.NetworkConnectivityResponse,
    `${STATUS_PREFIX}/connectivity`,
    req as any,
    timeout,
  );
}

export function getThrottlingMetadata(
  timeout?: moment.Duration,
): Promise<GetThrottlingMetadataResponse> {
  return timeoutFetch(
    serverpb.GetThrottlingMetadataResponse,
    `${STATUS_PREFIX}/throttling`,
    null,
    timeout,
  );
}

export function IsValidateUriName(...args: string[]): Promise<any> {
  for (const name of args) {
    if (name.includes("/")) {
      return Promise.reject(
        new Error(
          `util/api: The entity '${name}' contains '/' which is not currently supported in the UI.`,
        ),
      );
    }
  }
  return null;
}

export function EncodeUriName(name: string): string {
  return encodeURIComponent(name);
}
