import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Meal, MealSchema } from "src/schemas";

import { ManageController } from "./manage.controller";
import { ManageService } from "./manage.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Meal.name,
        schema: MealSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [ManageController],
  providers: [ManageService],
})
export class ManageModule {}
