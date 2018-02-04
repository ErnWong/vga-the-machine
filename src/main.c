#include <conio.h>
#include <graph.h>

int main()
{
  _setvideomode(_VRES16COLOR);
  _setcolor(1);
  _floodfill(0, 240, -1);
  _setcolor(15);
  _settextposition(10, 30);
  _outtext("hello world!");
  getch();
  _setvideomode(_DEFAULTMODE);
  return 0;
}
