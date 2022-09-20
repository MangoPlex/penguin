package xyz.mangostudio.penguin.structures;

import java.util.ArrayList;
import java.util.List;

public abstract class Handler<T> {
    private final List<T> entities = new ArrayList<>();

    public List<T> getEntities() {
        return this.entities;
    }

    @SafeVarargs
    public final void addToEntities(T... entities) {
        this.entities.addAll(List.of(entities));
    }
}
