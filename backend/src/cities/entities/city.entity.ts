import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cities')
export class City {
  @ApiProperty({
    description: 'Уникальный идентификатор города',
    example: 'b0d8d2a9-1d6b-4b8b-a9f8-8b31d2f1b3a4',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название города',
    example: 'Москва',
    maxLength: 150,
  })
  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;
}
