#include <iostream>

namespace Strings
{
  const char *ToUpper(const char *str, int endPoint, int startPoint = 0)
  {
    char *temporaryString = (char *)str;

    for (int i = startPoint; i < endPoint; ++i)
    {
      char c = str[i]; // char

      int8_t *valueOfChar = (int8_t *)&c;

      // check if value is between lowercase chars
      if (*valueOfChar <= 122 && *valueOfChar >= 97)
      {
        int8_t v2 = *valueOfChar & 0b1101'1111;
        temporaryString[i] = v2;
      }
      else
        temporaryString[i] = *valueOfChar;
    }

    return temporaryString;
  }

  const char *ToLower(const char *str, int endPoint, int startPoint = 0)
  {
    char *temporaryString = (char *)str;

    for (int i = startPoint; i < endPoint; ++i)
    {
      char c = str[i]; // char

      int8_t *valueOfChar = (int8_t *)&c;

      // check if value is between lowercase chars
      if (*valueOfChar <= 90 && *valueOfChar >= 65)
      {
        int8_t v2 = *valueOfChar | 0b0010'0000;
        temporaryString[i] = v2;
      }
      else
        temporaryString[i] = *valueOfChar;
    }

    return temporaryString;
  }
}

int main()
{
  char str[] = "-abCd;::gfgfL";

  std::cout << Strings::ToUpper(str, 6, 2);
}