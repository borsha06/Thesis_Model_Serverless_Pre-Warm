package serverless.modelcreator.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Graph {
    private List<Node> nodes = new LinkedList<>();

    public void addNode(Node node) {
        nodes.add(node);
    }
    public Node getNodeByName(String nodeName) {
        for (Node node : nodes) {
            if (node.getName().equals(nodeName)) {
                return node;
            }
        }
        return null;
    }

    public S3 getS3ByName(String dbName) {
        for (Node node : nodes) {
            if (node instanceof S3) {
                if (((S3) node).getBucketName().equals(dbName)) {
                    return (S3) node;
                }
            }
        }
        return null;
    }

    public void print() {
        System.out.println(toString());
    }

    public String toString() {
        StringBuilder result = new StringBuilder();
        for (Node node : nodes) {
            result.append(node.toString()).append(System.lineSeparator());
        }
        return result.toString();
    }

    public Function getFunctionByHandler(String handlerName) {
        for (Node node : nodes) {
            if (node instanceof Function) {
                if (((Function) node).getHandler().endsWith(handlerName)) {
                    return (Function) node;
                }
            }
        }
        return null;
    }

    public DynamoDB getDynamoDBbyName(String dbName) {
        for (Node node : nodes) {
            if (node instanceof DynamoDB) {
                if (((DynamoDB) node).getTableName().equals(dbName)) {
                    return (DynamoDB) node;
                }
            }
        }
        return null;
    }

    public Function getFunctionByName(String functionName) {
        for (Node node : nodes) {
            if (node instanceof Function) {
                if (((Function) node).getFunctionName().equals(functionName)) {
                    return (Function) node;
                }
            }
        }
        return null;
    }

    public  List<Direction> getArrows() {

        List<Direction> result = new LinkedList<>();
        for(Node node : nodes){
            result.addAll(node.getOutDirections());
        }
        return result;
    }

}
