import { Injectable } from "@nestjs/common";
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { Address, Contact, User } from "@prisma/client";
import { AddressResponse } from "src/model/address.model";


@Injectable()
export class TestService {
    constructor(private prismaService: PrismaService) { }
    
    async deleteUser() {
        await this.prismaService.user.deleteMany({
            where: {
                username: "test",
            }
        })
    }

    async createUser() {
        await this.prismaService.user.create({
            data: {
                username: "test",
                password: await bcrypt.hash('test', 10),
                name: "test",
                token: "test",
            }
        })
    }

    async getUser(): Promise<User> {
        return await this.prismaService.user.findUnique({
            where: {
                username: 'test',
            },
        });
    }

    async deleteContact() {
        await this.prismaService.contact.deleteMany({
            where: {
                username: "test",
            }
        })
    }

    async getContact(): Promise<Contact> {
        return this.prismaService.contact.findFirst({
            where: {
                username: 'test',
            },
        });
    }

    async createContact() {
        await this.prismaService.contact.create({
            data: {
                first_name: 'test',
                last_name: 'test',
                email: 'test@example.com',
                phone: '9999',
                username: 'test',
            },
        });
    }

    async getAddress(): Promise<Address> {
        return await this.prismaService.address.findFirst({
            where: {
                contact: {
                    username: 'test',
                },
            },
        });
    }

    async createAddress() {
        const contact = await this.getContact();
        await this.prismaService.address.create({
            data: {
                contact_id: contact.id,
                city: 'city test',
                street: 'street test',
                province: 'province test',
                country: 'country test',
                postal_code: '1111',
            },
        });
    };

    async deleteAddress() {
        await this.prismaService.address.deleteMany({
            where: {
                contact: {
                    username: 'test',
                },
            },
        });
    }
}