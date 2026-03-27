<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'contact_info'  => ['required', 'string', 'max:255'],
            'detail'        => ['required', 'string', 'min:10', 'max:2000'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ];
    }
}
