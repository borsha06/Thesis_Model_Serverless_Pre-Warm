package serverless.modelcreator.model;

public class CosmosDB extends Node{
    private String dbName = "";

    public CosmosDB(String nameOfNode) {
        this.setName(nameOfNode);
    }

    public void setDBName(String dbName) {
        this.dbName = dbName;
    }

    @Override
    public String toString() {
        String output = super.toString();
        output += "DB name: " + this.dbName + System.lineSeparator();
        return output;
    }

    public String getDBName() {
        return  dbName;

    }
}
