<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShopRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name'    => ['sometimes', 'string', 'max:255', 'regex:/^[\x{0E00}-\x{0E7F}a-zA-Z0-9\s\-_.,:()]+$/u'],
            'url'     => ['sometimes', 'url', 'max:500'],
            'channel' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }
}