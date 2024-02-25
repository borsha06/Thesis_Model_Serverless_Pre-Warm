package serverless.modelcreator.model;

import lombok.Getter;

@Getter
public class Storage extends Node{
    private String storageName = "";

    public Storage() {
    }

    public Storage(String nameOfNode) {
        this.setName(nameOfNode);
    }

    public void setStorageName(String storageName) {
        this.storageName = storageName;

    }

    @Override
    public String toString() {
        String output = super.toString();
        output += "Storage name: " + this.storageName + System.lineSeparator();
        return output;
    }

}
