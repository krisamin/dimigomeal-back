import {
  HttpException,
  Injectable,
  PipeTransform,
  HttpStatus,
} from "@nestjs/common";

@Injectable()
export class DatePipe implements PipeTransform<string> {
  transform(value: string) {
    if (value === "nono")
      throw new HttpException("Invalid Date", HttpStatus.BAD_REQUEST);

    return value;
  }
}
