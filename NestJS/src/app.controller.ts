import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommonApi, CommonFunction } from '@common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return CommonFunction('FromBackend');
  }

  @Post(CommonApi.Router)
  handleCommonApi(@Body() body: CommonApi.Req): CommonApi.Resp {
    const { A, B } = body;
    return {
      AconcatB: `${A}${B}`,
    };
  }
}
