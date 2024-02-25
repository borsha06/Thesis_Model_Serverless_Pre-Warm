
import React from 'react';
import FunctionList from './components/FunctionList';

import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";

const home = async () => {

  async function getLambdaNames(region = 'eu-north-2', functionVersion = 'ALL', maxItems = 20) {
    const client = new LambdaClient({});

    try {
      const response = await client.send(
          new ListFunctionsCommand({
            input: {
              MasterRegion: region,
              FunctionVersion: functionVersion,
              MaxItems: maxItems,
            },
          })
      );

      const functionNames = response.Functions.map((functionData) => `/aws/lambda/${functionData.FunctionName}`);
      return functionNames;
    } catch (error) {
      console.error('Error fetching Lambda function names:', error);
      throw error;
    }
  }
  let listOfNames;
  await (async () => {
    try {
      listOfNames = await getLambdaNames();
      console.log(listOfNames);
    } catch (error) {
      console.error('Error processing Lambda function names:', error);
    }
  })();


  const functionListComponents = listOfNames.map((functionName, index) => (
      <FunctionList
          key={index}
          funcName={functionName}
          avgColdCalls={'8'}
          avgColdstartDur={'168'}
          dataIndex={index * 2}
      />
  ));

  return (
      <div>
          <div className='row center'>

              <div>
                {functionListComponents}
              </div>
            </div>
          </div>
  );
};

export default home;
