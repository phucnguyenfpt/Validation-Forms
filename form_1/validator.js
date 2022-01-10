// Đối tượng
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // thực hiện validate check người dùng có nhập tên hay để trống
    function validate(inputElement, rule) {

        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        // lấy value người dùng nhập thông qua inputElement.value
        // check để xuất hiện thông báo invalid bằng cách rule.test(inputElement.value) nhận giá trị người dùng nhập
        var errMessage;

        // lấy ra các Rules của 1 Input
        var rules = selectorRules[rule.selector];

        // lặp qua các Rules và check từng Rule của từng Input\
        // Nếu có errMessage thì dừng ktra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox': {
                    errMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                }

                default: {
                    errMessage = rules[i](inputElement.value);

                }

            }
            if (errMessage) {
                break;
            }
        }

        // console.log(rules);

        // console.log(rule.test);
        var parentElementSelector = getParent(inputElement, options.formGroupSelector);
        if (errMessage) {
            errorElement.innerText = errMessage;
            parentElementSelector.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            parentElementSelector.classList.remove('invalid');
        }

        // console.log(!errMessage);
        return !errMessage;
    }

    // lấy Element của form
    var formElement = document.querySelector(options.form);
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function (event) {
            event.preventDefault();

            var isInvalidForm = true;

            // Thực hiện lặp qua các Rule và thực hiện validate  khi submit
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);

                if (!isValid) {
                    isInvalidForm = false;
                }
            });

            if (isInvalidForm) {

                // trường hợp Submit với  Javascript ~ có function onSubmit
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    // Array.from convert 1 đối tượng thành 1 Array
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio': {
                                // Cách 1
                                // if(input.matches(':checked')) {
                                //     values[input.name] = input.value;   
                                // } 
                                // break;

                                // Cách 2
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            }
                            case 'checkbox': {
                                if(!input.matches(':checked')) {
                                    // values[input.name] =  '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);
                                break;
                            }

                            case 'file': {
                                values[input.name] = input.files;
                                break;
                            }
                            default: {
                                values[input.name] = input.value;
                            }
                        }
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                }
                // trường hợp Submit với hành vi mặc định của trình duyệt ~ HTML
                else {
                    formElement.submit();
                }
            }

        }

        // Xử lý lặp qua các Rule và xử lý lắng nghe các sự kiện onblur, input
        options.rules.forEach(function (rule) {

            // lưu lại các Rules ~ 1 trường - Input có thể có nhiều hơn 1 Rule
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                //Xử lý trường hợp khi người dùng Blur ra ngoài
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // Xử lý khi người dùng nhập lại lần 2 ~ lúc nhập phải mất lỗi
                inputElement.oninput = function () {

                    var parentElementSelector = getParent(inputElement, options.formGroupSelector);

                    var errorElement = parentElementSelector.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    parentElementSelector.classList.remove('invalid');
                }
            });

        });
        console.log(selectorRules);
    }
}


// Định nghĩa rules
/**     Nguyên tắc rules
 *      1. Khi có lỗi => Trả ra message Lỗi ~ Invalid
 *      2. Khi hợp lệ => Không làm gì (không trả về gì hết ~ undefined)
 */
Validator.isRequired = function (fullname, message) {
    return {
        selector: fullname,
        test: function (value) {
            if (value == null) {
                return message || 'Vui lòng nhập trường này';
            }
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function (email, message) {
    return {
        selector: email,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}
Validator.minLength = function (selector, min, max) {
    return {
        selector: selector,
        test: function (value) {
            return (value.length >= min && value.length <= max) ? undefined : `Mật khẩu yêu cầu tối thiểu ${min} và tối đa ${max} kí tự`;
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmed, message) {
    return {
        selector: selector,
        test: function (value) {
            return (value === getConfirmed() ? undefined : message || 'Mật khẩu nhập không chính xác');
        }
    }
}