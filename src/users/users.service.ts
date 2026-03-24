
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'Создание пользователя';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updateMyPassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        refreshToken: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await verifyPassword(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Текущий пароль указан неверно');
    }

    const isNewPasswordSame = await verifyPassword(
      updatePasswordDto.newPassword,
      user.password,
    );

    if (isNewPasswordSame) {
      throw new BadRequestException(
        'Новый пароль должен отличаться от текущего',
      );
    }

    user.password = await hashPassword(updatePasswordDto.newPassword);
    user.refreshToken = null;

    await this.usersRepository.save(user);

    return {
      message: 'Пароль успешно обновлен',
    };

  // Обновить пользователя
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) throw new NotFoundException('Пользователь не найден в базе данных');
    
    return this.findOne(+id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
