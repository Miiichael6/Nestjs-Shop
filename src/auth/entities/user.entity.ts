import {
  Column,
  Entity,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Product } from "src/products/entities";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", select: false })
  password: string;

  @Column({ type: "text" })
  fullname: string;

  @Column({ type: "bool", default: true })
  isActive: boolean;

  @Column({ type: "text", default: ["user"], array: true })
  roles: string[];

  // ? One user has many products
  @OneToMany(() => Product, (product) => product, {
    onDelete: "CASCADE",
    // , eager: true //? Trae la relación de una vez
  })
  product: Product;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  @BeforeInsert()
  checkFieldBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldBeforeUpdate() {
    this.checkFieldBeforeInsert();
  }
}
