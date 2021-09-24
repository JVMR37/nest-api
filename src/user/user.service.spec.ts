import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import TestUtil from './../common/test/TestUtil';

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    mockRepository.find.mockReset();
    mockRepository.findOne.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.update.mockReset();
    mockRepository.delete.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When search All Users', () => {
    it('should be list all users', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.find.mockReturnValue([user, user]);
      const users = await service.findAllUsers();
      expect(users).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search User By Id', () => {
    it('should find a existing user', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.findOne.mockReturnValue(user);
      const userFound = await service.findUserById('1');
      expect(userFound).toMatchObject({ name: user.name });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return a exception when does not to find a user', async () => {
      mockRepository.findOne.mockReturnValue(null);
      expect(service.findUserById('3')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When create user', () => {
    it('should create a user', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.save.mockReturnValue(user);
      mockRepository.create.mockReturnValue(user);
      const savedUser = await service.createUser(user);

      expect(savedUser).toMatchObject(user);
      expect(mockRepository.create).toBeCalledTimes(1);
      expect(mockRepository.save).toBeCalledTimes(1);
    });

    it('should return a exception when doesnt create a user', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.save.mockReturnValue(null);
      mockRepository.create.mockReturnValue(user);

      await service.createUser(user).catch((e) => {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e).toMatchObject({
          message: 'Problema para criar um usuário!',
        });
      });
      expect(mockRepository.create).toBeCalledTimes(1);
      expect(mockRepository.save).toBeCalledTimes(1);
    });
  });

  describe('When update User', () => {
    it('Should update a user', async () => {
      const user = TestUtil.giveMeaValidUser();
      const updatedUser = { name: 'Nome Atualizado' };
      mockRepository.findOne.mockReturnValue(user);
      mockRepository.update.mockReturnValue({
        ...user,
        ...updatedUser,
      });
      mockRepository.create.mockReturnValue({
        ...user,
        ...updatedUser,
      });

      const resultUser = await service.updateUser('1', {
        ...user,
        name: 'Nome Atualizado',
      });

      expect(resultUser).toMatchObject(updatedUser);
      expect(mockRepository.create).toBeCalledTimes(1);
      expect(mockRepository.findOne).toBeCalledTimes(1);
      expect(mockRepository.update).toBeCalledTimes(1);
    });
  });

  describe('When delete User', () => {
    it('Should delete a existing user', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.delete.mockReturnValue(user);
      mockRepository.findOne.mockReturnValue(user);

      const deletedUser = await service.deleteUser('1');

      expect(deletedUser).toBe(true);
      expect(mockRepository.findOne).toBeCalledTimes(1);
      expect(mockRepository.delete).toBeCalledTimes(1);
    });

    it('Should not delete a inexisting user', async () => {
      const user = TestUtil.giveMeaValidUser();
      mockRepository.delete.mockReturnValue(null);
      mockRepository.findOne.mockReturnValue(user);

      const deletedUser = await service.deleteUser('9');

      expect(deletedUser).toBe(false);
      expect(mockRepository.findOne).toBeCalledTimes(1);
      expect(mockRepository.delete).toBeCalledTimes(1);
    });
  });
});
