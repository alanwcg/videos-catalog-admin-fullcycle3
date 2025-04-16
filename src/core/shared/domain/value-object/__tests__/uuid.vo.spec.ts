import { v4 as uuid, validate as validateUUID } from 'uuid';
import { InvalidUUIDError, UUID } from '../uuid.vo';

describe('UUID Unit Tests', () => {
  const validateUUIDSpy = jest.spyOn(UUID.prototype as any, 'validate');
  it('should throw error when uuid is invalid', () => {
    expect(() => {
      new UUID('invalid-uuid');
    }).toThrow(InvalidUUIDError);
    expect(validateUUIDSpy).toHaveBeenCalled();
  });

  it('should create a valid uuid', () => {
    const uuid = new UUID();
    expect(uuid.value).toBeDefined();
    expect(validateUUID(uuid.value)).toBe(true);
    expect(validateUUIDSpy).toHaveBeenCalled();
  });

  it('should accept a valid uuid', () => {
    const value = '5c986225-f6e8-4885-80dd-ba6d929a675b';
    const uuid = new UUID(value);
    expect(uuid.value).toBe(value);
    expect(validateUUIDSpy).toHaveBeenCalled();
  });
});
