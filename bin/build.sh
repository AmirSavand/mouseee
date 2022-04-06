./version.sh &&\
cd .. &&\
echo "Opening builder" &&\
auto-py-to-exe --config=bin/build.json &&\
echo "Built into dir (/output/Mouseee/)"
