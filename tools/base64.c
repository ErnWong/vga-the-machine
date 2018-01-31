/*
 * Reads a file and outputs the binary contents in base64, \n terminated
 */

#include <stdio.h>
#include <stdlib.h>

char map(char index)
{
  switch (index)
  {
    case 0: return 'A';
    case 1: return 'B';
    case 2: return 'C';
    case 3: return 'D';
    case 4: return 'E';
    case 5: return 'F';
    case 6: return 'G';
    case 7: return 'H';
    case 8: return 'I';
    case 9: return 'J';
    case 10: return 'K';
    case 11: return 'L';
    case 12: return 'M';
    case 13: return 'N';
    case 14: return 'O';
    case 15: return 'P';
    case 16: return 'Q';
    case 17: return 'R';
    case 18: return 'S';
    case 19: return 'T';
    case 20: return 'U';
    case 21: return 'V';
    case 22: return 'W';
    case 23: return 'X';
    case 24: return 'Y';
    case 25: return 'Z';
    case 26: return 'a';
    case 27: return 'b';
    case 28: return 'c';
    case 29: return 'd';
    case 30: return 'e';
    case 31: return 'f';
    case 32: return 'g';
    case 33: return 'h';
    case 34: return 'i';
    case 35: return 'j';
    case 36: return 'k';
    case 37: return 'l';
    case 38: return 'm';
    case 39: return 'n';
    case 40: return 'o';
    case 41: return 'p';
    case 42: return 'q';
    case 43: return 'r';
    case 44: return 's';
    case 45: return 't';
    case 46: return 'u';
    case 47: return 'v';
    case 48: return 'w';
    case 49: return 'x';
    case 50: return 'y';
    case 51: return 'z';
    case 52: return '0';
    case 53: return '1';
    case 54: return '2';
    case 55: return '3';
    case 56: return '4';
    case 57: return '5';
    case 58: return '6';
    case 59: return '7';
    case 60: return '8';
    case 61: return '9';
    case 62: return '+';
    case 63: return '/';
  }
  fprintf(stderr, "base64 index should be between 0 and 63 inclusive\n");
  fprintf(stderr, "There is a bug with the program.\n");
  exit(1);
  return 'A';
}

void send(char triplet[3])
{
  char index0 = (triplet[0] >> 2) & 0x3F;
  char index1 = ((triplet[0] << 4) & 0x30) | ((triplet[1] >> 4) & 0xF);
  char index2 = ((triplet[1] << 2) & 0x3C) | ((triplet[2] >> 6) & 0x3);
  char index3 = triplet[2] & 0x3F;
  putchar(map(index0));
  putchar(map(index1));
  putchar(map(index2));
  putchar(map(index3));
}

int main(int argc, char ** argv)
{
  FILE * in;
  int c;
  long int i;
  char triplet[3];

  if (argc != 2)
  {
    fprintf(stderr, "Missing or too many arguments\n");
    fprintf(stderr, "Usage: BASE64 [drive:][path]filename\n");
    return EXIT_FAILURE;
  }

  in = fopen(argv[1], "rb");
  if (!in)
  {
    perror("Error opening file");
    return EXIT_FAILURE;
  }

  i = 0;

  while ((c = fgetc(in)) != EOF)
  {
    triplet[i % 3] = (char)c;
    i++;
    if (i % 3 == 0)
    {
      send(triplet);
      triplet[0] = 0;
      triplet[1] = 0;
      triplet[2] = 0;
    }
  }
  if (i % 3)
  {
    send(triplet);
  }

  /* Signal end of file */
  putchar('\n');

  fprintf(stderr, "\nOriginal file size: %ld bytes\n", i);

  if (ferror(in))
  {
    perror("Error while reading file");
  }
  else if (feof(in))
  {
    return EXIT_SUCCESS;
  }

  return EXIT_FAILURE;
}
