package serverless.modelcreator.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Direction {

    private Node predecessor;

    private Node successor;
    private String multiplicity = "";
    private String condition = "";
    private int order = -1;
    private boolean synchronizedCall = false;

    private String arrowName;

    public Direction(Node predecessor, Node successor) {
        this.predecessor = predecessor;
        this.successor = successor;
        this.arrowName = predecessor.getName() + ":" + successor.getName();
    }

    public boolean isUnequal(Direction directionTmp) {
        return directionTmp.getOrder() - 1 != this.order || directionTmp.getPredecessor() != this.predecessor
                || directionTmp.getSuccessor() != this.successor
                || directionTmp.isSynchronizedCall() != this.isSynchronizedCall();
    }

    public String getName() {
        return this.arrowName;
    }

    public void setName(String name) {
        this.arrowName = name;
    }

    public String toString() {
        String result = "Name: " + arrowName + System.lineSeparator();
        result += "Predecessor: " + getPredecessor().getName() + System.lineSeparator();
        result += "Successor: " + getSuccessor().getName() + System.lineSeparator();

        if (isSynchronizedCall()) {
            result += "Synchronization: yes" + System.lineSeparator();
        }
        if (getOrder() != -1) {

            result += "Order: " + getOrder() + System.lineSeparator();
        }
        if (!getCondition().isEmpty()) {
            result += "Condition: " + getCondition() + System.lineSeparator();
        }
        return result;

    }


}
