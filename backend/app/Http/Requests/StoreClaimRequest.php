<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'fraud_type_id' => ['required', 'integer', 'exists:fraud_types,id'],
            'reason'        => ['required', 'string', 'min:10', 'max:2000'],
            'contact_info'  => ['nullable', 'string', 'max:255'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ];
    }
}