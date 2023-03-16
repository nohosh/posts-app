import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('user',(T)=>{
        T.increments('id').primary();
        T.string('name');
        T.string('email');
        T.string('password');
        T.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
        T.timestamp('updatedAt').notNullable();
    }).then(async ()=>{
        await knex.schema.createTable('post',(T)=>{
            T.increments('id').primary();
            T.string('title').notNullable();
            T.integer('authorId').unsigned().references('id').inTable('user');
            T.text('content');
            T.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
            T.timestamp('updatedAt').notNullable()
        })
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user');
    await knex.schema.dropTable('post');
}

