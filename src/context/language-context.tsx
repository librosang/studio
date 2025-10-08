
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Currency } from '@/lib/types';

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.stock': 'Stock',
    'nav.shop': 'Shop',
    'nav.pos': 'POS',
    'nav.accounting': 'Accounting',
    'nav.log': 'Log',
    'nav.accounts': 'Accounts',
    'nav.settings': 'Settings',

    // General
    'general.success': 'Success!',
    'general.error': 'Error',
    'general.loading': 'Loading...',
    'general.name': 'Name',
    'general.email': 'Email',
    'general.role': 'Role',
    'general.actions': 'Actions',
    'general.language': 'Language',
    'general.english': 'English',
    'general.arabic': 'العربية (Arabic)',
    'general.select_language': 'Select language',
    'general.not_authenticated': 'Not Authenticated',
    'general.must_be_logged_in': 'You must be logged in.',
    'general.permission_denied': 'Permission denied.',

    // Login Page
    'login.title': 'StockFlow',
    'login.description': 'Enter your email to sign in. (e.g., manager@test.com or john@test.com)',
    'login.email_label': 'Email',
    'login.email_placeholder': 'm@example.com',
    'login.signin_button': 'Sign In',
    'login.user_not_found': 'User not found',

    // Home Page
    'home.title': 'StockFlow',
    'home.subtitle': 'An intelligent, streamlined solution for modern inventory management. Get started in seconds.',
    'home.get_started': 'Get Started',
    'home.go_to_login': 'Go to Login',
    'home.powered_by': 'Powered by Firebase & Google AI',

    // Dashboard Page
    'dashboard.title': 'Dashboard',
    'dashboard.description': "Today's Summary: {date}",
    'dashboard.total_revenue': 'Total Revenue',
    'dashboard.items_sold': '{count} items sold',
    'dashboard.total_returns': 'Total Returns',
    'dashboard.items_returned': '{count} items returned',
    'dashboard.new_stock': 'New Stock',
    'dashboard.restocked_items': '{count} items restocked',
    'dashboard.net_items_change': 'Net Items Change',
    'dashboard.net_inventory_movement': 'Net inventory movement',
    'dashboard.top_selling_today': 'Top Selling Today',
    'dashboard.top_selling_description': "Your most popular products from today's sales.",
    'dashboard.no_sales_yet': 'No sales recorded yet today.',
    'dashboard.come_back_later': "Check back after you've made some sales!",
    'dashboard.expiring_soon': 'Expiring Soon',
    'dashboard.expiring_soon_desc': 'Products expiring in the next 30 days.',
    'dashboard.days_left': 'days',
    'dashboard.no_expiring_products': 'No products expiring soon.',
    'dashboard.total_expenses': 'Total Expenses',
    'dashboard.expenses_today_desc': 'Expenses recorded today.',
    'dashboard.net_profit': 'Net Profit',
    'dashboard.profit_today_desc': 'Today\'s net profit.',
    'dashboard.weekly_financial_overview': 'Last 7 Days Financial Overview',
    'dashboard.weekly_financial_desc': 'Revenue, expenses, and profit trends.',
    'dashboard.no_financial_data': 'No financial data for this period.',
    
    // Stock Page
    'stock.title': 'Stock Management',
    'stock.description': 'Manage your products. Add, edit, or delete items.',
    'stock.filter_products': 'Filter products...',
    'stock.add_product': 'Add Product',
    'stock.no_products_found': 'No products found.',
    'stock.seed_data': 'Seed Sample Data',
    'stock.previous': 'Previous',
    'stock.next': 'Next',
    
    // Product Form
    'product_form.add_title': 'Add New Product',
    'product_form.edit_title': 'Edit Product',
    'product_form.product_name': 'Product Name',
    'product_form.name_placeholder': 'e.g. Organic T-Shirt',
    'product_form.category': 'Category',
    'product_form.category_placeholder': 'e.g. Apparel',
    'product_form.suggest_category_error': 'Enter a product name first.',
    'product_form.suggestion_applied': 'Suggestion applied!',
    'product_form.category_set_to': 'Category set to "{category}".',
    'product_form.brand': 'Brand',
    'product_form.brand_placeholder': 'e.g. EcoThreads',
    'product_form.image_url': 'Image URL',
    'product_form.image_url_placeholder': 'https://picsum.photos/seed/1/200/300',
    'product_form.barcode': 'Barcode (EAN, UPC)',
    'product_form.barcode_placeholder': 'e.g. 9780201379624',
    'product_form.scan_barcode': 'Scan Barcode',
    'product_form.stock_quantity': 'Stock Qty',
    'product_form.shop_quantity': 'Shop Qty',
    'product_form.price': 'Price',
    'product_form.expiry_date': 'Expiry Date',
    'product_form.pick_expiry_date': 'Pick an expiry date',
    'product_form.add_button': 'Add Product',
    'product_form.save_button': 'Save Changes',
    'product_form.success_added': 'Product has been added.',
    'product_form.success_updated': 'Product has been updated.',
    'product_form.enter_barcode_error': 'Please enter or scan a barcode to look up.',
    'product_form.product_found_title': 'Product Found!',
    'product_form.populated_data_desc': 'Populated data for {name}.',

    // Transfer Form
    'transfer_form.title': 'Transfer to Shop',
    'transfer_form.available_stock': 'In Stock:',
    'transfer_form.available_shop': 'In Shop:',
    'transfer_form.quantity_to_transfer': 'Quantity to Transfer',
    'transfer_form.error_not_enough_stock': 'Not enough stock ({count}).',
    'transfer_form.success': '{quantity} x {name} transferred to shop.',
    'transfer_form.button': 'Transfer to Shop',

    // Data Table Row Actions (Stock)
    'data_table.open_menu': 'Open menu',
    'data_table.transfer_to_shop': 'Transfer to Shop',
    'data_table.edit': 'Edit',
    'data_table.delete': 'Delete',
    'data_table.are_you_sure': 'Are you sure?',
    'data_table.delete_product_confirm': 'This will permanently delete the product.',
    'data_table.cancel': 'Cancel',
    'data_table.continue': 'Continue',
    'data_table.product_deleted': 'Product deleted.',
    
    // Expenses / Accounting
    'expenses.title': 'Accounting Management',
    'expenses.description': 'Track and manage your business finances.',
    'expenses.add_expense': 'Add Expense',
    'expenses.no_expenses': 'No expenses recorded yet.',
    'expenses.add_first_expense': 'Add your first expense to get started.',
    'expenses.date': 'Date',
    'expenses.category': 'Category',
    'expenses.description_label': 'Description (Optional)',
    'expenses.amount': 'Amount',
    'expenses.category_placeholder': 'e.g., Rent, Utilities',
    'expenses.description_placeholder': 'e.g., Office rent for May',
    'expenses.delete_expense_confirm': 'This will permanently delete the expense.',
    'expenses.expense_deleted': 'Expense deleted.',
    'expenses.add_new_title': 'Add New Expense',
    'expenses.add_new_desc': 'Fill in the details to record a new expense.',
    'expenses.edit_title': 'Edit Expense',
    'expenses.edit_desc': 'Update the details of your expense.',
    'expenses.expense_saved': 'Expense has been saved.',
    'expenses.save_button': 'Save Expense',
    'expenses.breakdown_title': 'Expense Breakdown',
    'expenses.breakdown_desc': 'A visual breakdown of expenses by category.',
    'expenses.no_breakdown_data': 'Not enough data to display breakdown chart.',
    

    // Shop Page
    'shop.title': 'Shop',
    'shop.description': 'Select products to sell or process returns.',
    'shop.filter_category': 'Filter by category',
    'shop.all_categories': 'All Categories',
    'shop.filter_brand': 'Filter by brand',
    'shop.all_brands': 'All Brands',
    'shop.no_products_match': 'No products match filters.',

    // POS Page
    'pos.title': 'POS Mode',
    'pos.description': 'A cashier-friendly interface for quick sales.',
    'pos.search_placeholder': 'Search or scan barcode...',
    'pos.product_added': 'Product Added',
    'pos.product_added_desc': '{name} added to cart.',
    'pos.product_not_found': 'Product not found',
    'pos.product_not_found_desc': 'Barcode "{barcode}" not found.',
    'pos.no_products_found': 'No products found.',

    // Transaction Panel (Shop & POS)
    'transaction.title': 'Current Transaction',
    'transaction.cart_empty': 'Your cart is empty.',
    'transaction.add_products_prompt': 'Add products from the list.',
    'transaction.pos_start_prompt': 'Click on a product to start.',
    'transaction.sales': 'Sales',
    'transaction.returns': 'Returns',
    'transaction.items': 'items',
    'transaction.total': 'Total:',
    'transaction.validate': 'Validate Transaction',
    'transaction.cart_is_empty': 'Cart is empty',
    'transaction.add_items_to_proceed': 'Add items to the cart.',
    'transaction.failed': 'Transaction Failed',
    'transaction.success': 'Transaction completed.',

    // Receipt
    'receipt.title': 'Transaction Successful',
    'receipt.cashier': 'Cashier:',
    'receipt.thank_you': 'Thank you!',
    'receipt.close': 'Close',
    'receipt.print': 'Print Receipt',
    
    // Log Page
    'log.title': 'Activity Log',
    'log.description': 'A history of all inventory changes and transactions.',
    'log.export_excel': 'Export to Excel',
    'log.pick_date': 'Pick a date',
    'log.no_entries': 'No log entries yet.',

    // Accounts Page
    'accounts.title': 'Account Management',
    'accounts.description': 'View and manage user accounts and roles.',
    'accounts.add_account': 'Add Account',
    'accounts.create_new_account': 'Create New Account',
    'accounts.create_cashier_desc': 'Create a new cashier account.',
    'accounts.full_name': 'Full Name',
    'accounts.name_placeholder': 'John Doe',
    'accounts.email_placeholder': 'j.doe@example.com',
    'accounts.select_role': 'Select a role',
    'accounts.cashier_role': 'Cashier',
    'accounts.manager_role': 'Manager',
    'accounts.create_account_button': 'Create Account',
    'accounts.account_saved_success': 'Account for {name} has been {action}.',
    'accounts.action_created': 'created',
    'accounts.action_updated': 'updated',
    'accounts.edit_account': 'Edit Account',
    'accounts.delete_account_confirm': 'This will permanently delete the account for {name}.',
    'accounts.account_deleted': 'Account deleted.',
    'accounts.delete_primary_manager_error': "Can't delete the primary manager.",

    // Settings Page
    'settings.title': 'Settings',
    'settings.description': 'Manage application settings.',
    'settings.currency': 'Currency',
    'settings.select_currency': 'Select currency',

  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.stock': 'المخزون',
    'nav.shop': 'المتجر',
    'nav.pos': 'نقطة البيع',
    'nav.accounting': 'المحاسبة',
    'nav.log': 'السجل',
    'nav.accounts': 'الحسابات',
    'nav.settings': 'الإعدادات',

    // General
    'general.success': 'نجاح!',
    'general.error': 'خطأ',
    'general.loading': 'جار التحميل...',
    'general.name': 'الاسم',
    'general.email': 'البريد الإلكتروني',
    'general.role': 'الدور',
    'general.actions': 'الإجراءات',
    'general.language': 'اللغة',
    'general.english': 'English',
    'general.arabic': 'العربية',
    'general.select_language': 'اختر اللغة',
    'general.not_authenticated': 'غير مصادق عليه',
    'general.must_be_logged_in': 'يجب عليك تسجيل الدخول.',
    'general.permission_denied': 'الأذن مرفوض.',

    // Login Page
    'login.title': 'ستوك فلو',
    'login.description': 'أدخل بريدك الإلكتروني للدخول (مثال: manager@test.com)',
    'login.email_label': 'البريد الإلكتروني',
    'login.email_placeholder': 'm@example.com',
    'login.signin_button': 'تسجيل الدخول',
    'login.user_not_found': 'المستخدم غير موجود',

    // Home Page
    'home.title': 'ستوك فلو',
    'home.subtitle': 'حل ذكي ومبسط لإدارة المخزون الحديثة. ابدأ في ثوانٍ.',
    'home.get_started': 'ابدأ الآن',
    'home.go_to_login': 'اذهب إلى تسجيل الدخول',
    'home.powered_by': 'مدعوم من Firebase و Google AI',

    // Dashboard Page
    'dashboard.title': 'لوحة التحكم',
    'dashboard.description': "ملخص اليوم: {date}",
    'dashboard.total_revenue': 'إجمالي الإيرادات',
    'dashboard.items_sold': 'بيع {count} منتجات',
    'dashboard.total_returns': 'إجمالي المرتجعات',
    'dashboard.items_returned': 'إرجاع {count} منتجات',
    'dashboard.new_stock': 'مخزون جديد',
    'dashboard.restocked_items': 'إعادة تخزين {count} منتجات',
    'dashboard.net_items_change': 'صافي التغيير',
    'dashboard.net_inventory_movement': 'صافي حركة المخزون',
    'dashboard.top_selling_today': 'الأكثر مبيعاً اليوم',
    'dashboard.top_selling_description': 'المنتجات الأكثر شيوعًا من مبيعات اليوم.',
    'dashboard.no_sales_yet': 'لا توجد مبيعات مسجلة اليوم.',
    'dashboard.come_back_later': 'تحقق مرة أخرى بعد إجراء بعض المبيعات!',
    'dashboard.expiring_soon': 'منتجات قاربت على الانتهاء',
    'dashboard.expiring_soon_desc': 'المنتجات التي تنتهي صلاحيتها في غضون 30 يومًا.',
    'dashboard.days_left': 'أيام',
    'dashboard.no_expiring_products': 'لا توجد منتجات ستنتهي صلاحيتها قريبًا.',
    'dashboard.total_expenses': 'إجمالي المصاريف',
    'dashboard.expenses_today_desc': 'المصاريف المسجلة اليوم.',
    'dashboard.net_profit': 'صافي الربح',
    'dashboard.profit_today_desc': 'صافي الربح لليوم.',
    'dashboard.weekly_financial_overview': 'نظرة عامة مالية لآخر 7 أيام',
    'dashboard.weekly_financial_desc': 'اتجاهات الإيرادات والمصروفات والأرباح.',
    'dashboard.no_financial_data': 'لا توجد بيانات مالية لهذه الفترة.',
    
    // Stock Page
    'stock.title': 'إدارة المخزون',
    'stock.description': 'إدارة منتجاتك. إضافة أو تعديل أو حذف العناصر.',
    'stock.filter_products': 'تصفية المنتجات...',
    'stock.add_product': 'إضافة منتج',
    'stock.no_products_found': 'لم يتم العثور على منتجات.',
    'stock.seed_data': 'إضافة بيانات تجريبية',
    'stock.previous': 'السابق',
    'stock.next': 'التالي',
    
    // Product Form
    'product_form.add_title': 'إضافة منتج جديد',
    'product_form.edit_title': 'تعديل المنتج',
    'product_form.product_name': 'اسم المنتج',
    'product_form.name_placeholder': 'مثال: تيشيرت قطني',
    'product_form.category': 'الفئة',
    'product_form.category_placeholder': 'مثال: ملابس',
    'product_form.suggest_category_error': 'أدخل اسم المنتج أولاً.',
    'product_form.suggestion_applied': 'تم تطبيق الاقتراح!',
    'product_form.category_set_to': 'تم تعيين الفئة إلى "{category}".',
    'product_form.brand': 'العلامة التجارية',
    'product_form.brand_placeholder': 'مثال: EcoThreads',
    'product_form.image_url': 'رابط الصورة',
    'product_form.image_url_placeholder': 'https://picsum.photos/seed/1/200/300',
    'product_form.barcode': 'الباركود (EAN, UPC)',
    'product_form.barcode_placeholder': 'مثال: 9780201379624',
    'product_form.scan_barcode': 'مسح الباركود',
    'product_form.stock_quantity': 'كمية المخزون',
    'product_form.shop_quantity': 'كمية المتجر',
    'product_form.price': 'السعر',
    'product_form.expiry_date': 'تاريخ انتهاء الصلاحية',
    'product_form.pick_expiry_date': 'اختر تاريخ انتهاء الصلاحية',
    'product_form.add_button': 'إضافة منتج',
    'product_form.save_button': 'حفظ التغييرات',
    'product_form.success_added': 'تمت إضافة المنتج.',
    'product_form.success_updated': 'تم تحديث المنتج.',
    'product_form.enter_barcode_error': 'الرجاء إدخال أو مسح الباركود للبحث عنه.',
    'product_form.product_found_title': 'تم العثور على المنتج!',
    'product_form.populated_data_desc': 'تم ملء البيانات لـ {name}.',

    // Transfer Form
    'transfer_form.title': 'نقل إلى المتجر',
    'transfer_form.available_stock': 'في المخزن:',
    'transfer_form.available_shop': 'في المتجر:',
    'transfer_form.quantity_to_transfer': 'الكمية المراد نقلها',
    'transfer_form.error_not_enough_stock': 'لا يوجد مخزون كافٍ ({count}).',
    'transfer_form.success': 'تم نقل {quantity} x {name} إلى المتجر.',
    'transfer_form.button': 'نقل إلى المتجر',

    // Data Table Row Actions (Stock & Expenses)
    'data_table.open_menu': 'فتح القائمة',
    'data_table.transfer_to_shop': 'نقل إلى المتجر',
    'data_table.edit': 'تعديل',
    'data_table.delete': 'حذف',
    'data_table.are_you_sure': 'هل أنت واثق؟',
    'data_table.delete_product_confirm': 'سيؤدي هذا إلى حذف المنتج نهائيًا.',
    'data_table.cancel': 'إلغاء',
    'data_table.continue': 'متابعة',
    'data_table.product_deleted': 'تم حذف المنتج.',
    
     // Expenses / Accounting
    'expenses.title': 'إدارة المحاسبة',
    'expenses.description': 'تتبع وإدارة الشؤون المالية لعملك.',
    'expenses.add_expense': 'إضافة مصروف',
    'expenses.no_expenses': 'لم يتم تسجيل أي مصاريف حتى الآن.',
    'expenses.add_first_expense': 'أضف أول مصروف لك للبدء.',
    'expenses.date': 'التاريخ',
    'expenses.category': 'الفئة',
    'expenses.description_label': 'الوصف (اختياري)',
    'expenses.amount': 'المبلغ',
    'expenses.category_placeholder': 'مثال: الإيجار، الفواتير',
    'expenses.description_placeholder': 'مثال: إيجار المكتب لشهر مايو',
    'expenses.delete_expense_confirm': 'سيؤدي هذا إلى حذف المصروف نهائيًا.',
    'expenses.expense_deleted': 'تم حذف المصروف.',
    'expenses.add_new_title': 'إضافة مصروف جديد',
    'expenses.add_new_desc': 'املأ التفاصيل لتسجيل مصروف جديد.',
    'expenses.edit_title': 'تعديل المصروف',
    'expenses.edit_desc': 'تحديث تفاصيل المصروف.',
    'expenses.expense_saved': 'تم حفظ المصروف.',
    'expenses.save_button': 'حفظ المصروف',
    'expenses.breakdown_title': 'توزيع المصاريف',
    'expenses.breakdown_desc': 'توزيع مرئي للمصاريف حسب الفئة.',
    'expenses.no_breakdown_data': 'لا توجد بيانات كافية لعرض مخطط التوزيع.',


    // Shop Page
    'shop.title': 'المتجر',
    'shop.description': 'اختر المنتجات للبيع أو لمعالجة المرتجعات.',
    'shop.filter_category': 'تصفية حسب الفئة',
    'shop.all_categories': 'جميع الفئات',
    'shop.filter_brand': 'تصفية حسب العلامة التجارية',
    'shop.all_brands': 'جميع الماركات',
    'shop.no_products_match': 'لا توجد منتجات تطابق المرشحات.',

    // POS Page
    'pos.title': 'نقطة البيع',
    'pos.description': 'واجهة صديقة للكاشير للمبيعات السريعة.',
    'pos.search_placeholder': 'ابحث أو امسح الباركود...',
    'pos.product_added': 'تمت إضافة المنتج',
    'pos.product_added_desc': 'تمت إضافة {name} إلى السلة.',
    'pos.product_not_found': 'المنتج غير موجود',
    'pos.product_not_found_desc': 'الباركود "{barcode}" غير موجود.',
    'pos.no_products_found': 'لم يتم العثور على منتجات.',

    // Transaction Panel (Shop & POS)
    'transaction.title': 'المعاملة الحالية',
    'transaction.cart_empty': 'عربتك فارغة.',
    'transaction.add_products_prompt': 'أضف منتجات من القائمة.',
    'transaction.pos_start_prompt': 'انقر على منتج للبدء.',
    'transaction.sales': 'المبيعات',
    'transaction.returns': 'المرتجعات',
    'transaction.items': 'منتجات',
    'transaction.total': 'الإجمالي:',
    'transaction.validate': 'تأكيد المعاملة',
    'transaction.cart_is_empty': 'العربة فارغة',
    'transaction.add_items_to_proceed': 'أضف منتجات إلى العربة.',
    'transaction.failed': 'فشلت المعاملة',
    'transaction.success': 'اكتملت المعاملة.',

    // Receipt
    'receipt.title': 'نجاح العملية',
    'receipt.cashier': 'الكاشير:',
    'receipt.thank_you': 'شكرا لك!',
    'receipt.close': 'إغلاق',
    'receipt.print': 'اطبع الإيصال',
    
    // Log Page
    'log.title': 'سجل النشاطات',
    'log.description': 'سجل لجميع تغييرات المخزون والمعاملات.',
    'log.export_excel': 'تصدير إلى Excel',
    'log.pick_date': 'اختر تاريخا',
    'log.no_entries': 'لا توجد إدخالات سجل حتى الآن.',

    // Accounts Page
    'accounts.title': 'إدارة الحساب',
    'accounts.description': 'عرض وإدارة حسابات المستخدمين وأدوارهم.',
    'accounts.add_account': 'إضافة حساب',
    'accounts.create_new_account': 'إنشاء حساب جديد',
    'accounts.create_cashier_desc': 'إنشاء حساب كاشير جديد.',
    'accounts.full_name': 'الاسم الكامل',
    'accounts.name_placeholder': 'جون دو',
    'accounts.email_placeholder': 'j.doe@example.com',
    'accounts.select_role': 'اختر دورًا',
    'accounts.cashier_role': 'كاشير',
    'accounts.manager_role': 'مدير',
    'accounts.create_account_button': 'إنشاء حساب',
    'accounts.account_saved_success': 'تم {action} حساب {name}.',
    'accounts.action_created': 'إنشاء',
    'accounts.action_updated': 'تحديث',
    'accounts.edit_account': 'تعديل حساب',
    'accounts.delete_account_confirm': 'سيؤدي هذا إلى حذف حساب {name} نهائيًا.',
    'accounts.account_deleted': 'تم حذف الحساب.',
    'accounts.delete_primary_manager_error': "لا يمكن حذف المدير الأساسي.",

    // Settings Page
    'settings.title': 'الإعدادات',
    'settings.description': 'إدارة إعدادات التطبيق.',
    'settings.currency': 'العملة',
    'settings.select_currency': 'اختر العملة',
  },
};


type TranslationKey = keyof typeof translations.en;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type CurrencyContextType = {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
    }

    const storedCurrency = localStorage.getItem('currency') as Currency | null;
    if (storedCurrency) {
        setCurrencyState(storedCurrency);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  }

  const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
    const defaultOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency,
        ...options,
    };
    
    let formatted = new Intl.NumberFormat(language, defaultOptions).format(value);

    if (currency === 'MAD' && language === 'en') {
        // For English, Intl often shows MAD at the end. We want DH at the start.
        // It might produce "1,234.56 MAD". We replace it.
        const numericValue = new Intl.NumberFormat(language, { ...defaultOptions, style: 'decimal' }).format(value);
        formatted = `DH${numericValue}`;
    } else if (currency === 'MAD' && language === 'ar') {
        // For Arabic, Intl might produce "١٬٢٣٤٫٥٦ د.م.‏". We'll replace د.م.‏ with د.إ
        formatted = formatted.replace('د.م.‏', 'د.م.');
    }


    return formatted;
  }

  const t = (key: TranslationKey, replacements: Record<string, string | number> = {}) => {
    let translation = translations[language]?.[key] || translations['en'][key] || key;
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
    });
    return translation;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  if (!isMounted) {
    // Avoid rendering mismatch between server and client
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency}}>
            {children}
        </CurrencyContext.Provider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return { t: context.t, lang: context.language, dir: context.dir };
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a LanguageProvider');
    }
    return context;
}
