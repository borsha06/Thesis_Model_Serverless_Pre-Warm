package serverless.modelcreator.controller;

import com.fasterxml.jackson.databind.JsonNode;
import serverless.modelcreator.model.Function;

public class CloudProviderHandler {

    public static void configureFunction(Function function, JsonNode properties, String cloudProvider) {
        if ("AWS".equals(cloudProvider)) {
            setAwsProperties(function, properties);
        } else if ("Azure".equals(cloudProvider)) {
            setAzureProperties(function, properties);
        } else if ("GCP".equals(cloudProvider)) {
            setGcpProperties(function, properties);
        } else {
            throw new IllegalArgumentException("Unsupported cloud provider: " + cloudProvider);
        }
    }

    private static void setAwsProperties(Function function, JsonNode properties) {
        // AWS-specific configuration logic
        function.setFunctionName(properties.path("FunctionName").asText());
        function.setHandler(properties.path("Handler").asText());
        function.setRuntime(properties.path("Runtime").asText());
        function.setPolicies(properties.path("Policies").toString());
    }

    private static void setAzureProperties(Function function, JsonNode properties) {
        // Azure-specific configuration logic
        function.setFunctionName(properties.get("name").asText());
        function.setKind(properties.get("kind").asText());

    }

    private static void setGcpProperties(Function function, JsonNode properties) {
        // GCP-specific configuration logic
        function.setFunctionName(properties.get("functionName").asText());
        function.setRuntime(properties.get("runtime").asText());
        function.setPolicies(properties.get("policies").toString());
    }
}
