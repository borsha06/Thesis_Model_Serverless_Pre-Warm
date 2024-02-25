const dotenv = require('dotenv');

import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand } from "@aws-sdk/client-cloudwatch-logs";
import React from "react";
const startQueryCommandFunction = async (funcName: string | null) => {
  const client = new CloudWatchLogsClient({ region: 'eu-north-1' });
  const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endTime = new Date();
  const input = {
    logGroupName: funcName,
    startTime: startTime.getTime(),
    endTime: endTime.getTime(),
    queryString: 'fields @ingestionTime, @initDuration, @logStream, @message, @timestamp, @type, @billedDuration, @duration, @maxMemoryUsed, @memorySize | sort @timestamp desc',
    limit: 1,
  };
  console.log(funcName);
  const command = new StartQueryCommand(input);
  const response = await client.send(command);
  return response;
};

const getQueryCommandFunction = async (queryId: string | undefined) => {
  const client = new CloudWatchLogsClient(dotenv.config);
  const input = {
    queryId: queryId,
  };
  const command = new GetQueryResultsCommand(input);
  const response = await client.send(command);
  return response;
};

const getQueryStatus = async (queryId: string) => {
  const client = new CloudWatchLogsClient({ region: 'eu-north-1' });
  const command = new GetQueryResultsCommand({ queryId });

  try {
    const response = await client.send(command);
    return response.status; // "Scheduled", "Running", "Complete", "Failed", "Cancelled", "Timeout", "Unknown"
  } catch (error) {
    console.error('Error getting query status:', error);
    throw error; // Re-throw to indicate failure
  }
}

const getLogs = async (funcName: string) => {
  const queryResult = await startQueryCommandFunction(funcName);
  const queryId = queryResult.queryId;

  while (true) {
    const queryStatus = await getQueryStatus(queryId);
    if (queryStatus === 'Complete') {
      const logs = await getQueryCommandFunction(queryId);
      return logs.results; // Or process logs further if needed
    } else if (queryStatus === 'Failed' || queryStatus === 'Cancelled' || queryStatus === 'Timeout') {
      throw new Error(`Query failed: ${queryStatus}`);
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};
const functionList = async ({ funcName, avgColdCalls }: any) => {

  const initInfoTemplate = {
    timestamp: '2023-12-14 18:18:43.243',
    initDuration: '181.02',
    warmInvocationsDuration: ['11.04', '1.91', '2.36', '1.92', '1.36'],
    day: '2023-12-14',
  };

  let initInfo = [initInfoTemplate, { ...initInfoTemplate }];

  const gotResults = await getLogs(funcName);
  console.log(gotResults);

  const funcNameSliced = funcName.substring(funcName.lastIndexOf('/') + 1);

  return (
      <div style={{
        width: '70vw',
      }}>

        <div className='row'>
          <div className='p-1'>
            <title>{funcNameSliced}</title>
          </div>
          <div className='p-1 max-w-45 max-h-15 '>
          </div>
          <div>
            <div>
              <text>{avgColdCalls}</text>
            </div>
          </div>
        </div>
      </div>
  );
};

export default functionList ;