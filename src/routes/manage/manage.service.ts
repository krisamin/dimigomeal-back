import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as cheerio from "cheerio";
import moment from "moment";
import { Model } from "mongoose";

import { Meal, MealDocument } from "src/schemas";

@Injectable()
export class ManageService {
  constructor(
    @InjectModel(Meal.name)
    private mealModel: Model<MealDocument>,

    private readonly configService: ConfigService,

    private readonly httpService: HttpService,
  ) {}

  private async getMealList(): Promise<any> {
    const response = await this.httpService.axiosRef.get(
      "https://www.dimigo.hs.kr/index.php?mid=school_cafeteria&page=1",
    );
    const $ = cheerio.load(response.data);

    const rowList = [];
    const $rowList = $("#siLst thead th");
    for (const [, th] of $rowList.toArray().entries()) {
      rowList.push($(th).text().replace(/\n/g, "").trim());
    }

    const col = [];
    const $colList = $("#siLst tbody tr");
    for (const [, tr] of $colList.toArray().entries()) {
      const $col = $(tr);
      const trList = [];
      for (const [index, td] of $col.find("td").toArray().entries()) {
        trList[rowList[index]] = $(td)
          .text()
          .replace(/\n/g, "")
          .trim()
          .replace(/<(?:.|\n)*?>/gm, "");
      }
      trList["주소"] = $col.find(".title a").attr("href");
      col.push(trList);
    }

    return col;
  }

  private async getMealDetail(url: string): Promise<any> {
    const response = await this.httpService.axiosRef.get(url);

    const $ = cheerio.load(response.data);
    const $mealList = $(".scConDoc").text().split("\n");

    const meal = ["", "", ""];
    for (let $meal of $mealList) {
      $meal = $meal
        .replace(/<(?:.|\n)*?>/gm, "")
        .replace(/\t/g, "")
        .replace(/ /g, "")
        .replace("*", "");
      if ($meal != "" && $meal !== undefined) {
        const type = $meal.split(":")[0];
        const item = $meal.split(":").slice(1).join(":");
        if (item !== undefined) {
          meal[["조식", "중식", "석식"].indexOf(type.substr(0, 2))] =
            item.trim();
        }
      }
    }

    return meal;
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async updateMeals(): Promise<Meal[]> {
    const mealList = await this.getMealList();
    const list = [];
    for (const meal of mealList) {
      const data = {
        id: 0,
        year: 0,
        month: 0,
        day: 0,
        date: "",
        meal: {
          breakfast: "",
          lunch: "",
          dinner: "",
        },
      };
      data.id = meal["번호"] * 1;
      const splittedTitle = meal["제목"].split("월");
      if (splittedTitle.length < 2) continue;

      data.year = meal["등록일"].split("-")[0];
      data.month = splittedTitle[0].replace(/[^0-9]/g, "");
      data.day = splittedTitle[1].replace(/[^0-9]/g, "");

      data.month *= 1;
      data.day *= 1;
      if (!isNaN(data.month) && !isNaN(data.day)) {
        if (moment().month() - data.month >= 3) {
          data.year += 1;
        }
        if (moment().month() - data.month <= -3) {
          data.year -= 1;
        }

        data.date = moment(
          `${data.year}-${data.month}-${data.day}`,
          "YYYY-MM-DD",
        ).format("YYYY-MM-DD");

        const mealDetail = await this.getMealDetail(meal["주소"]);
        data.meal.breakfast = mealDetail[0] || "";
        data.meal.lunch = mealDetail[1] || "";
        data.meal.dinner = mealDetail[2] || "";

        list.push({
          id: data.id,
          date: data.date,
          meal: data.meal,
        });
      }
    }

    const meals = [];
    for (const meal of list) {
      meals.push(
        await this.mealModel.findOneAndUpdate(
          {
            id: meal.id,
          },
          {
            $set: {
              date: meal.date,
              breakfast: meal.meal.breakfast,
              lunch: meal.meal.lunch,
              dinner: meal.meal.dinner,
            },
          },
          {
            upsert: true,
            new: true,
          },
        ),
      );
    }

    return meals;
  }
}
