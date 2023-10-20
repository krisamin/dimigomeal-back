import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import { schemaOptions } from "./options";

export type MealDocument = HydratedDocument<Meal>;

@Schema(schemaOptions)
export class Meal {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  breakfast: string;

  @Prop({ required: true })
  lunch: string;

  @Prop({ required: true })
  dinner: string;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
