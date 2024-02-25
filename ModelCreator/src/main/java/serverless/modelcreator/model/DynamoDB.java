package serverless.modelcreator.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter

public class DynamoDB extends Node {

    private String tableName = "";

    public DynamoDB(String nameOfNode) {
        this.setName(nameOfNode);
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    @Override
    public String toString() {
        String output = super.toString();
        output += "Table name: " + this.tableName + System.lineSeparator();
        return output;
    }

}
