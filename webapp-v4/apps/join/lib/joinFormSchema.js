/**
 * Schema for the joining form
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.10.2025
 **/
import {z} from 'zod';

import {phoneSchema} from '../../../common/schemas/GenericSchemas';


const organizationNameSchema = z.string()
  .min(3, 'Der Verein/Organisations-Name muss mindestens 3 Zeichen lang sein.')
  .max(60, 'Der Verein/Organisations-Name darf höchstens 60 Zeichen lang sein.');

const teamNameSchema = z.string()
  .min(3, 'Der Team-Name muss mindestens 3 Zeichen lang sein.')
  .max(60, 'Der Team-Name darf höchstens 60 Zeichen lang sein.');

const remarksSchema = z.string()
  .max(10000, 'Die Bemerkungen sollten unter 10000 Zeichen lang sein');

const joinFormSchema = z.object({
  name: teamNameSchema,
  organization: organizationNameSchema,
  phone: phoneSchema,
  remarks: remarksSchema
})

export {joinFormSchema};
