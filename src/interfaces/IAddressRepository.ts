import {
    Address,
    CreateAddressData,
    UpdateAddressData
} from "../types/address.types";

export interface IAddressRepository {
    // CRUD básico
    create(addressData: CreateAddressData): Promise<Address>;
    findByUid(uid: string): Promise<Address | null>;
    update(uid: string, addressData: UpdateAddressData): Promise<Address>;
    delete(uid: string): Promise<boolean>;

    // Operações específicas de endereço
    findByPersonUid(personUid: string): Promise<Address[]>;
    findPrimaryByPersonUid(personUid: string): Promise<Address | null>;
    setPrimaryAddress(personUid: string, addressUid: string): Promise<boolean>;
    unsetOtherPrimaryAddresses(personUid: string, addressUid: string): Promise<void>;
    deactivateAddress(uid: string, updatedByUserUid: string): Promise<boolean>;
    activateAddress(uid: string, updatedByUserUid: string): Promise<boolean>;
}