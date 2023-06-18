import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("text", { nullable: false })
  url: string;

  // muchas imagenes pertenecen a un producto
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  product: Product;
}
