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
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Product {
  @ApiProperty({
    example: "cd533345-f1f3-48c9-a62e-7dc2da50c9f9",
    description: "Product Id",
    uniqueItems: true
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @ApiProperty({
    example: "Camiseta xxl",
    description: "Product Title",
    uniqueItems: true
  })
  @Column("text", { unique: true })
  title: string;
  
  @ApiProperty({
      example: 0,
      description: "Product Price"
    })
  @Column({ type: "float", default: 0 })
  price: number;
  
  @ApiProperty({
    example: "Lorem ipsum dolor bla bla bla",
    description: "Product description",
    default: null
  })
  @Column("text", { nullable: true })
  description: string;
  
  @ApiProperty({
    example: "Camiseta xxl",
    description: "Product Slug - SEO",
    uniqueItems: true
  })
  @Column("text", { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: "Product stock",
    default: 0
  })
  @Column("int", { default: 0 })
  stock: number;
  
  @ApiProperty({
    example: ["M", "XL", "XXL"],
    description: "Product images"
  })
  @Column("text", { array: true, default: [] })
  sizes: string[];
  
  @ApiProperty({
    example: "women",
    description: "Product gender",
  })
  @Column("text")
  gender: string;
  
  @ApiProperty()
  @Column("text", { array: true, default: [] })
  tags: string[];
  
  // Un producto tiene muchas imagenes
  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
    // el "eager" hace que no tengamos que hacer relaciones en traer otras tablas
    //  en peticiones GET
    // porque las trae automaticamente
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
