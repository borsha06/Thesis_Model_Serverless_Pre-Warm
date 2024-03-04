package serverless.modelcreator.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.yaml.snakeyaml.Yaml;
import serverless.modelcreator.model.*;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.FileWriter;

public class Composer {
    public static void main(String[] args) throws IOException {
        String resourceFilePath = "./serverless2.json";
        Graph graph = new Graph();
        String cloudProvider = "";
        createModel(resourceFilePath, graph);

        String jsonResult = convertGraphToJson(graph); // convert to json
        System.out.println(1);
        System.out.println(jsonResult);

        System.out.println("Graph:" + System.lineSeparator());

        graph.print();



    }
    private static void configureFunction(Function function, JsonNode properties, String cloudProvider) {
        CloudProviderHandler.configureFunction(function, properties, cloudProvider);
    }

    private static void createModel(String filePathStackFile, Graph graph) throws IOException {
        Path path = Paths.get(filePathStackFile);
        ObjectMapper objectMapper = new ObjectMapper();
        byte[] jsonData = Files.readAllBytes(path);
        JsonNode root = objectMapper.readTree(jsonData);


        if (Files.exists(path)) {
            String fileExtension = getFileExtension(filePathStackFile); // Check file extension
            switch (fileExtension) {
                case "yaml":
                    if (checkStringInYamlFile(filePathStackFile)) {     // Used Snake Yaml to convert yaml to string to find aws in string
                        System.out.println("aws");
                        modelForAws(root, graph);
                    } else {
                        System.out.println("gcp");
                    }
                    break;

                case "json":
                    try {
                        JsonNode description = root.path("Description");

                        JsonNode resourcesNode = root.path("resources");

                        if (containsAws(root)) {
                            modelForAws(root, graph); // Separated the functionality for better usage

                        } else {
                            System.out.println("azure");
                            byte[] jsonData2 = Files.readAllBytes(path);
                            ObjectMapper objectMapper2 = new ObjectMapper();


                            JsonNode azureDescription = root.path("parameters").get("appName").path("metadata").path("description");


                            System.out.println("Description: " + azureDescription.asText());

                            JsonNode azureResourcesNode = root.path("resources");
                         //   System.out.println(azureResourcesNode);
                            Iterator<Map.Entry<String, JsonNode>> azureResources;


                            for (JsonNode resourceNode : resourcesNode) {
                                    if (resourceNode.isObject() && resourceNode.has("type")) {
                                        JsonNode objectType = resourceNode.path("type");
                                        JsonNode DbKind =  resourceNode.path("kind");
                                        String nodeName = resourceNode.get("type").asText();
                                        if (isAzureServerlessFunction(objectType)) {
                                            String cloudProvider = "Azure";

                                            Function function = new Function(nodeName);
                                            configureFunction(function, resourceNode, cloudProvider);

                                            graph.addNode(function);

                                        }
                                        else if (isAzureStorageAccount(objectType)) {
                                            Storage storage = new Storage(nodeName);
;
                                            setStorageName(storage, resourceNode);
                                            graph.addNode(storage);

                                        }
                                        else if (isCosmosDB(DbKind)) {
                                            CosmosDB cosmosDB = new CosmosDB(nodeName);
                                            setCosmosName(cosmosDB, resourceNode);
                                            graph.addNode(cosmosDB);
                                        }


                                    }
                                }
                            ObjectNode jsonObject = objectMapper.createObjectNode();

                            // Check if the JsonNode is an array
                            if (azureResourcesNode.isArray()) {
                                // Iterate over array elements
                                for (JsonNode element : azureResourcesNode) {
                                  //  System.out.println(element);
                                    // Assuming each element has a single key-value pair
                                    if (element.isObject()) {
                                        // Get the key and value from the element
                                        String key = element.fieldNames().next();
                                        JsonNode value = element.get(key);

                                        // Add key-value pair to the new object
                                        jsonObject.set(key, value);
                                    //    System.out.println(jsonObject);
                                    }
                                }
                            //    System.out.println(jsonObject);
                            }

                            azureResources = azureResourcesNode.fields();
                         //   System.out.println(azureResourcesNode.isArray());
                          //  System.out.println(azureResources.hasNext());
                            while (azureResources.hasNext()) {

                                Map.Entry<String, JsonNode> resource = azureResources.next();

                                System.out.println(resource);

                                String nameOfNode = resource.getKey();
                                JsonNode resourceNode = resource.getValue();

                            }
                        }
                    } catch (IOException e) {
                        System.err.println("File could not be read");
                        e.printStackTrace();
                    }
                    break;
                default:
                    throw new IllegalStateException("Unexpected value: " + fileExtension);
            }
        }
    }

    private static void setCosmosName(CosmosDB cosmosDB, JsonNode resourceNode) {
        JsonNode node = resourceNode.path("databaseName");
        cosmosDB.setDBName(node.toString().replaceAll("\"", "").trim());
    }

    private static void setStorageName(Storage storage, JsonNode resourceNode) {
        JsonNode node = resourceNode.path("name");

        storage.setStorageName(node.toString().replaceAll("\"", "").trim());
    }

    private static void setDynamoName(DynamoDB dynamo, JsonNode properties) {
        JsonNode node = properties.path("TableName");
        dynamo.setTableName(node.toString().replaceAll("\"", "").trim());
    }

    private static void setBucketName(S3 s3, JsonNode properties) {
        JsonNode node = properties.path("BucketName");

        s3.setBucketName(node.toString().replaceAll("\"", "").trim());
    }

    private static boolean isDynamoDB(JsonNode type) {
        return type.toString().contains("AWS::DynamoDB::Table");
    }

    private static boolean isS3Instance(JsonNode type) {
        return type.toString().contains("AWS::S3::Bucket");
    }

    private static boolean isAwsServerlessFunction(JsonNode type) {
        return type.toString().contains("AWS::Serverless::Function");
    }
    private static boolean isAzureServerlessFunction(JsonNode type){
        return type.toString().contains("Microsoft.Web/sites");

    }
    private static boolean isAzureStorageAccount(JsonNode type) {
        return type.toString().contains("Microsoft.Storage/storageAccounts");
    }

    private static boolean isCosmosDB(JsonNode kind) {
        return kind.toString().contains("GlobalDocumentDB");
    }

    public static String getFileExtension(String fullFileName) {
        checkNotNull(fullFileName);
        String fileName = new File(fullFileName).getName();
        int index = fileName.lastIndexOf('.');
        return (index == -1) ? "" : fileName.substring(index + 1);
    }

    public static void modelForAws(JsonNode root, Graph graph) {

        JsonNode awsResourcesNode = root.path("Resources");
        Iterator<Map.Entry<String, JsonNode>> awsResources = awsResourcesNode.fields();

        while (awsResources.hasNext()) {

            Map.Entry<String, JsonNode> resource = awsResources.next();

            String nodeName = resource.getKey();
            JsonNode resourceNode = resource.getValue();


            JsonNode type = resourceNode.path("Type");


            if (isAwsServerlessFunction(type)) {
                String cloudProvider = "AWS";

                JsonNode properties = resourceNode.path("Properties");

                Function function = new Function(nodeName);
                configureFunction(function, properties, cloudProvider);

                graph.addNode(function);

            } else if (isS3Instance(type)) {
                S3 s3 = new S3(nodeName);

                JsonNode properties = resourceNode.path("Properties");
                setBucketName(s3, properties);
                graph.addNode(s3);

            } else if (isDynamoDB(type)) {
                DynamoDB dynamo = new DynamoDB(nodeName);
                JsonNode properties = resourceNode.path("Properties");
                setDynamoName(dynamo, properties);
                graph.addNode(dynamo);

            }
        }

        awsResources = awsResourcesNode.fields();

        while (awsResources.hasNext()) {

            Map.Entry<String, JsonNode> resource = awsResources.next();

            String nameOfNode = resource.getKey();
            JsonNode resourceNode = resource.getValue();

            JsonNode type = resourceNode.path("Type");
            if (isAwsServerlessFunction(type)) {
                JsonNode properties = resourceNode.path("Properties");
            //    System.out.println(properties);
                if (properties.has("Events")) {
                    JsonNode eventNode = properties.path("Events");
                    Iterator<JsonNode> eventIterator = eventNode.elements();
                    while (eventIterator.hasNext()) {
                        JsonNode event = eventIterator.next();
                        JsonNode typeNode = event.path("Type");
                        if (typeNode.asText().contains("S3")) {
                            JsonNode propertiesOfEvent = event.path("Properties");
                            JsonNode bucketOfEvent = propertiesOfEvent.path("Bucket");


                            JsonNode triggerDB = bucketOfEvent.path("Ref");
                            String nameOfTriggerDB = triggerDB.asText();
                            Node dbNode = graph.getNodeByName(nameOfTriggerDB);
                            Node triggeredNode = graph.getNodeByName(nameOfNode);


                            Direction arrow = new Direction(dbNode, triggeredNode);
                            dbNode.addOutArrow(arrow);
                        }
                    }
                }
            }
        }

    }

    public static void modelForAzure(JsonNode root, Graph graph){
        JsonNode awsResourcesNode = root.path("resources");
        Iterator<Map.Entry<String, JsonNode>> azureResources = awsResourcesNode.fields();


    }

    public static boolean checkStringInYamlFile(String filePathStackFile) throws FileNotFoundException {
        Yaml yaml = new Yaml();
        InputStream inputStream = new FileInputStream(filePathStackFile);
        Map<String, Object> data = yaml.load(inputStream);
        Pattern pattern = Pattern.compile("Microsoft");
        Matcher matcher = pattern.matcher(data.toString());
        return matcher.find();

    }

    private static boolean containsAws(JsonNode jsonNode) {
        if (jsonNode.isTextual()) {
            String textValue = jsonNode.asText();
            return textValue.contains("AWS");
        } else if (jsonNode.isObject()) {
            for (JsonNode field : jsonNode) {
                if (containsAws(field)) {
                    return true;
                }
            }
        } else if (jsonNode.isArray()) {
            for (JsonNode element : jsonNode) {
                if (containsAws(element)) {
                    return true;
                }
            }
        }
        return false;
    }
    private static String convertGraphToJson(Graph graph) {
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode resultNode = objectMapper.createObjectNode();

        // Iterate through nodes in the graph
        for (Node node : graph.getNodes()) {
            ObjectNode nodeObject = objectMapper.createObjectNode();
            nodeObject.put("Name", node.getName());

            if (node instanceof Function) {
                Function function = (Function) node;
                nodeObject.put("Function name", function.getFunctionName());
                nodeObject.put("Handler", function.getHandler());
                nodeObject.put("Runtime", function.getRuntime());
                nodeObject.set("Policies", convertListToJsonArray(Collections.singletonList(function.getPolicies())));
                nodeObject.put("Kind", function.getKind());
            } else if (node instanceof Storage) {
                Storage storage = (Storage) node;
                nodeObject.put("Storage name", storage.getStorageName());
            } else if (node instanceof CosmosDB) {
                CosmosDB cosmosDB = (CosmosDB) node;
                nodeObject.put("Database name", cosmosDB.getDBName());
            }

            // Add the node to the result JSON
            resultNode.set(node.getName(), nodeObject);
            List<Direction> outDirections = node.getOutDirections();
            for (Direction arrow : outDirections) {
                ObjectNode arrowObject = objectMapper.createObjectNode();
                arrowObject.put("Predecessor", arrow.getPredecessor().getName());
                arrowObject.put("Successor", arrow.getSuccessor().getName());
                arrowObject.put("Order", arrow.getOrder());
                arrowObject.put("SynchronizedCall", arrow.isSynchronizedCall());

                nodeObject.set(arrow.getSuccessor().getName(), arrowObject);
            }

            // Add the node to the result JSON
            resultNode.set(node.getName(), nodeObject);
            resultNode.set(node.getName(), nodeObject);
        }

        try {
            objectMapper.writeValue(new File("./dag2.json"), resultNode );


        } catch (IOException e) {
            e.printStackTrace();
        }

        return resultNode.toString();
    }

    private static ArrayNode convertListToJsonArray(java.util.List<String> list) {
        ObjectMapper objectMapper = new ObjectMapper();
        ArrayNode arrayNode = objectMapper.createArrayNode();
        for (String item : list) {
            arrayNode.add(item);
        }
        return arrayNode;
    }
}