import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AddressService } from '../services/address.service';

export class AddressController {
	private addressService: AddressService;

	constructor(addressService: AddressService) {
		this.addressService = addressService;
	}

	public static validations = {
		create: [
			body('personUid').notEmpty().isUUID(),
			body('street').notEmpty().trim(),
			body('city').notEmpty().trim(),
			body('state').notEmpty().trim(),
			body('country').optional().trim(),
			body('number').optional().trim(),
			body('neighborhood').optional().trim(),
			body('zipCode').optional().trim(),
			body('observation').optional().trim(),
		],
		update: [
			body('street').optional().trim(),
			body('city').optional().trim(),
			body('state').optional().trim(),
			body('country').optional().trim(),
			body('number').optional().trim(),
			body('neighborhood').optional().trim(),
			body('zipCode').optional().trim(),
			body('observation').optional().trim(),
			body('isPrimary').optional().isBoolean(),
		]
	};

	public create = async (req: Request, res: Response): Promise<Response> => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const address = await this.addressService.createAddress(req.body, req.user?.uid ?? "");
			return res.status(201).json({
				success: true,
				message: 'Address created successfully',
				data: address
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public getByUid = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const address = await this.addressService.getAddressByUid(uid);
			return res.json({
				success: true,
				message: 'Address found',
				data: address
			});
		} catch (error: any) {
			return res.status(404).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public update = async (req: Request, res: Response): Promise<Response> => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { uid } = req.params;
			const address = await this.addressService.updateAddress(uid, req.body, req.user?.uid ?? "");
			return res.json({
				success: true,
				message: 'Address updated successfully',
				data: address
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public delete = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const deleted = await this.addressService.deleteAddress(uid);
			if (!deleted) {
				return res.status(404).json({
					success: false,
					message: 'Address not found',
					data: null
				});
			}
			return res.status(204).send();
		} catch (error: any) {
			return res.status(500).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public getPersonAddresses = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { personUid } = req.params;
			const addresses = await this.addressService.getPersonAddresses(personUid);
			return res.json({
				success: true,
				message: 'Addresses found',
				data: addresses
			});
		} catch (error: any) {
			return res.status(500).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public setPrimaryAddress = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { personUid, addressUid } = req.params;
			const success = await this.addressService.setPrimaryAddress(personUid, addressUid);
			if (!success) {
				return res.status(400).json({
					success: false,
					message: 'Failed to set primary address',
					data: null
				});
			}
			return res.json({
				success: true,
				message: 'Primary address set successfully',
				data: null
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	// Adicionar estes métodos ao AddressController existente (controllers/address.controller.ts)

	public deactivate = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const success = await this.addressService.deactivateAddress(uid, req.user?.uid ?? "");
			if (!success) {
				return res.status(404).json({
					success: false,
					message: 'Address not found',
					data: null
				});
			}
			return res.json({
				success: true,
				message: 'Address deactivated successfully',
				data: null
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public activate = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const success = await this.addressService.activateAddress(uid, req.user?.uid ?? "");
			if (!success) {
				return res.status(404).json({
					success: false,
					message: 'Address not found',
					data: null
				});
			}
			return res.json({
				success: true,
				message: 'Address activated successfully',
				data: null
			});
		} catch (error: any) {
			return res.status(400).json({
				success: false,
				message: error.message,
				data: null
			});
		}
	}
}
