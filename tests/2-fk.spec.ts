import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";
import { Id, IdType } from "../types";

@Entity()
export class ParentEntity {
    @PrimaryKey({ type: IdType, autoincrement: false })
    id!: Id;

    @PrimaryKey({ type: IdType, autoincrement: false })
    id2!: Id;

    @OneToMany(() => ChildEntity, child => child.parent)
    children = new Collection<ChildEntity>(this);
}

@Entity()
export class ChildEntity {
    @PrimaryKey({ autoincrement: false })
    id!: number;

    @ManyToOne(() => ParentEntity)
    parent!: ParentEntity;
}

describe('Entity with 2 primary key', () => {
    let orm: MikroORM;

    beforeAll(async () => {
        orm = await MikroORM.init({
            entities: [ParentEntity, ChildEntity],
            dbName: ':memory:',
        });

        await orm.schema.refreshDatabase();
    });

    afterAll(async () => {
        await orm.close();
    });

    it('should create and persist entity along with child entity', async () => {
        const parentRepository = orm.em.fork().getRepository(ParentEntity);

        // Create parent
        const parent = new ParentEntity();
        parent.id = new Id(1);
        parent.id2 = new Id(2);

        // Create child
        const child = new ChildEntity();
        child.id = 1;

        // Add child to parent
        parent.children.add(child)

        await parentRepository.persistAndFlush(parent);
    })
});