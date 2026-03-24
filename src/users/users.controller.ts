

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updateMyPassword(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updateMyPassword(req.user.id, updatePasswordDto);
  }

  // Обновление данных пользователя
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
