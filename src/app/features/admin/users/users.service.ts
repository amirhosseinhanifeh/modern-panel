import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, User } from '../../../core/models/user/user.model';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private readonly http = inject(HttpClient);
    // آدرس فرضی API شما؛ در صورت داشتن اندپوینت واقعی آن را جایگزین کنید
    private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

    getUsers(page: number = 1, limit: number = 5, search: string = ''): Observable<PaginatedResponse<User>> {
        const params = new HttpParams()
            .set('_page', page.toString())
            .set('_limit', limit.toString())
            .set('q', search.trim());

        // نکته: jsonplaceholder هدر X-Total-Count برمی‌گرداند؛ در API سازمانی شما فرمت پاسخ معمولاً شیء استاندارد است.
        // در اینجا یک شبیه‌سازی دقیق و اصولی از قرارداد سرور پیاده می‌کنیم:
        return new Observable<PaginatedResponse<User>>((observer) => {
            this.http.get<User[]>(this.apiUrl, { params, observe: 'response' }).subscribe({
                next: (res) => {
                    const totalHeader = res.headers.get('x-total-count');
                    const total = totalHeader ? parseInt(totalHeader, 10) : 10; // مقدار پیش‌فرض اگر هدر موجود نبود
                    observer.next({
                        data: res.body ?? [],
                        total: total,
                        page: page,
                        limit: limit,
                    });
                    observer.complete();
                },
                error: (err) => observer.error(err),
            });
        });
    }

    createUser(userDto: CreateUserDto): Observable<User> {
        return this.http.post<User>(this.apiUrl, userDto);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateUser(id: number, userDto: CreateUserDto): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, userDto);
    }
}

// تایپ داده‌ای که فرم می‌فرستد (بدون id)
export type CreateUserDto = Omit<User, 'id'>;
