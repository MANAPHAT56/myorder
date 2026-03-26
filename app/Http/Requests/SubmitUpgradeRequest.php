<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

/**
 * UC17+UC20: validate ไฟล์เอกสาร KYC
 */
class SubmitUpgradeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'files'          => ['required', 'array', 'min:1', 'max:5'],
            'files.*'        => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'labels'         => ['required', 'array'],
            'labels.*'       => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'files.required'    => 'กรุณาแนบเอกสารอย่างน้อย 1 ไฟล์',
            'files.*.mimes'     => 'รองรับเฉพาะไฟล์ JPG, PNG, PDF เท่านั้น',
            'files.*.max'       => 'ขนาดไฟล์ต้องไม่เกิน 10MB',
        ];
    }
}
