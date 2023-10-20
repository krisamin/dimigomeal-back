import { Controller, Get } from "@nestjs/common";

import { Meal } from "src/schemas";

import { ManageService } from "./manage.service";

@Controller("manage")
export class ManageController {
  constructor(private readonly manageService: ManageService) {}

  @Get()
  async updateMeals(): Promise<Meal[]> {
    return this.manageService.updateMeals();
  }
}
