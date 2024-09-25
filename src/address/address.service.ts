import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Address, User } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "../common/prisma.service";
import { ValidationService } from "../common/validation.service";
import { AddressResponse, CreateAddressRequest, GetAddressRequest, RemoveAddressRequest, UpdateAddressRequest } from "../model/address.model";
import { Logger } from 'winston'
import { AddressValidation } from "./address.validation";
import { ContactService } from "../contact/contact.service";
 
@Injectable()
export class AddressService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private prismaService: PrismaService,
        private validationService: ValidationService,
        private contactService: ContactService,
    ) { }
    
    async create(user: User, request: CreateAddressRequest):Promise<AddressResponse> {
        const createRequest: CreateAddressRequest = await this.validationService.validate(AddressValidation.CREATE, request);

        await this.contactService.checkContactMustExists(user.username, createRequest.contact_id);

        const address = await this.prismaService.address.create({
            data: createRequest,
        });

        return this.toAddressResponse(address);
    }

    async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
        const getRequest: GetAddressRequest = await this.validationService.validate(AddressValidation.GET, request);

        await this.contactService.checkContactMustExists(user.username, getRequest.contact_id);
        
        const address = await this.checkAddressMustExists(getRequest.address_id, getRequest.contact_id);

        return this.toAddressResponse(address);
    };

    async update(user: User, request: UpdateAddressRequest): Promise<AddressResponse> {
        this.logger.debug(
            `AddressService.Update(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
        );
        const updateRequest: UpdateAddressRequest = this.validationService.validate(AddressValidation.UPDATE, request);
        
        await this.contactService.checkContactMustExists(user.username, updateRequest.contact_id);

        let address = await this.checkAddressMustExists(updateRequest.id, updateRequest.contact_id);
        
        address = await this.prismaService.address.update({
            where: {
                id: address.id,
            },
            data: updateRequest,
        });

        return this.toAddressResponse(address);
    }

    async remove(user: User, request: RemoveAddressRequest):Promise<AddressResponse> {
        const removeRequest: RemoveAddressRequest = this.validationService.validate(AddressValidation.REMOVE, request);
        await this.contactService.checkContactMustExists(user.username, removeRequest.contact_id);
        await this.checkAddressMustExists(request.address_id, request.contact_id);

        const address = await this.prismaService.address.delete({
            where: {
                id: removeRequest.address_id,
            },
        });

        return this.toAddressResponse(address);
    }

    toAddressResponse(address: Address): AddressResponse {
        return {
            id: address.id,
            street: address.street,
            city: address.city,
            province: address.province,
            country: address.country,
            postal_code: address.postal_code,
        }
    }

    async checkAddressMustExists(address_id: number, contactId: number):Promise<Address>  {
        const address = await this.prismaService.address.findFirst({
            where: {
                id: address_id,
                contact_id: contactId,
            },
        });

        if (!address) {
            throw new HttpException('Address is not found', 404);
        }
        
        return address;
    }

    async list(user: User, contactId: number):Promise<AddressResponse[]> {
        await this.contactService.checkContactMustExists(user.username, contactId);

        const addresses = await this.prismaService.address.findMany({
            where: {
                contact_id: contactId,
            },
        });

        return addresses.map((address) => this.toAddressResponse(address));
    }
}