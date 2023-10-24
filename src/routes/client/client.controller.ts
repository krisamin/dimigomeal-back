import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import moment from "moment";

import { DatePipe } from "src/common";

import { Meal } from "src/schemas";

import { ClientService } from "./client.service";

@Controller()
@ApiTags("Client")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({
    summary: "오늘의 식단표",
  })
  @ApiOkResponse({
    type: Meal,
  })
  @Get()
  async index(): Promise<Meal> {
    return this.clientService.get(moment().format("YYYY-MM-DD"));
  }

  @ApiOperation({
    summary: "이번주 식단표",
  })
  @ApiOkResponse({
    type: Meal,
    isArray: true,
  })
  @Get("week")
  async week(): Promise<Meal[]> {
    return this.clientService.week();
  }

  @ApiOperation({
    summary: "날짜별 식단표",
  })
  @ApiOkResponse({
    type: Meal,
  })
  @ApiParam({
    name: "date",
    description: "날짜",
    example: "2022-08-18",
  })
  @Get(":date")
  async get(@Param("date", DatePipe) date: string): Promise<Meal> {
    console.log(date);
    return this.clientService.get(date);
  }
}
