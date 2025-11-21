import { EntitySchema } from "typeorm"

export default new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id_usuario: {
      primary: true,
      type: "int",
      generated: true,
    },
    password_hash: {
      type: "varchar",
      nullable: true
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: true
    },
    fullname: {
      type: "varchar",
      nullable: true
    },
    isAdmin: {
      type: "boolean",
      nullable: true,
      default: false
    }
  }
});
