import { User } from "src/auth/entities/user.entity";
import { ProductImage } from "./product-image.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { unique: true })
  title: string;

  @Column({ type: "float", default: 0 })
  price: number;

  @Column("text", { nullable: true })
  description: string;

  @Column("text", { unique: true })
  slug: string;

  @Column("int", { default: 0 })
  stock: number;

  @Column("text", { array: true, default: [] })
  sizes: string[];

  @Column("text")
  gender: string;

  @Column("text", { array: true, default: [] })
  tags: string[];

  // Un producto tiene muchas imagenes
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
    // el "eager" hace que no tengamos que hacer relaciones en traer otras tablas
    //  en peticiones GET
    // porqu las trae automaticamente
  )
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, {onDelete: "CASCADE"})
  user: User

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title.replaceAll(" ", "_").replaceAll("'", "");
    }

    this.slug = this.slug.toLowerCase();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(" ", "_")
      .replaceAll("'", "");
  }
}
