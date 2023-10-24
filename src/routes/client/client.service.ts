import { HttpException, Injectable, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import moment from "moment";
import { Model } from "mongoose";

import { Meal, MealDocument } from "src/schemas";

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Meal.name)
    private mealModel: Model<MealDocument>,
  ) {}

  async get(date: string): Promise<Meal> {
    const meal = await this.mealModel.findOne({
      date: date,
    });

    if (!meal) throw new HttpException("Not Found", HttpStatus.NOT_FOUND);

    return meal;
  }

  async week(): Promise<Meal[]> {
    const meals = await this.mealModel
      .find({
        date: {
          $gte: moment().startOf("week").format("YYYY-MM-DD"),
          $lte: moment().endOf("week").format("YYYY-MM-DD"),
        },
      })
      .sort({
        date: 1,
      });

    if (!meals) throw new HttpException("Not Found", HttpStatus.NOT_FOUND);

    return meals;
  }
}
