package serverless.modelcreator.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedList;
import java.util.List;

@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Node {

    private String name = "";
    
    private List<Direction> outDirections = new LinkedList<>();


    private List<Direction> inDirections = new LinkedList<>();

    public void setName(String name) {
        this.name = name;
    }

    public void addOutArrow(Direction direction) {
        outDirections.add(direction);
        direction.getSuccessor().addIngoingArrow(direction);
    }

    public void addIngoingArrow(Direction direction) {
        inDirections.add(direction);
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder("Name: " + name + System.lineSeparator());
        for (Direction direction : outDirections) {
            result.append("Successor: ").append(direction.getSuccessor().getName()).append(System.lineSeparator());
            result.append("Order: ").append(direction.getOrder()).append(System.lineSeparator());
            if (direction.isSynchronizedCall()) {
                result.append("Synchronization: yes").append(System.lineSeparator());
            }
        }

        for (Direction direction : inDirections) {
            result.append("Predecessor: ").append(direction.getPredecessor().getName()).append(System.lineSeparator());
            result.append("Order: ").append(direction.getOrder()).append(System.lineSeparator());
            if (direction.isSynchronizedCall()) {
                result.append("Synchronization: yes").append(System.lineSeparator());
            }
        }

        return result.toString();
    }

    public List<Direction> getInDirections() { return inDirections;
    }
    public String getName() {
        return name;
    }

    public List<Direction> getOutDirections() {
        return outDirections;
    }
}
