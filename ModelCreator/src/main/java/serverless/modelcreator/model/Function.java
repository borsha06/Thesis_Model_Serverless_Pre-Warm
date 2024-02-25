package serverless.modelcreator.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Function extends Node{
    private String functionName = "";

    private String handler = "";

    private String runtime = "";

    private String policies = "";

    private String kind = "";


    public Function(String node) {
        this.setName(node);
    }

    public void setFunctionName(String functionName) {
        this.functionName = functionName;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public void setPolicies(String policies) {
        this.policies = policies;
    }

    public void setHandler(String handler) {
        this.handler = handler;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    @Override
    public String toString() {
        String output = super.toString();
        output += "Function name: " + this.functionName + System.lineSeparator();
        output += "Handler: " + this.handler + System.lineSeparator();
        output += "Runtime: " + this.runtime + System.lineSeparator();
        output += "Policies: " + this.policies + System.lineSeparator();
        output += "Kind: " + this.kind + System.lineSeparator();
        return output;
    }



}
